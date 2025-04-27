import { BaseFileService } from './base-file.service';
import { BadRequestException, Injectable } from '@nestjs/common';
import { parse } from 'csv-parse/sync';
import { z, ZodIssue } from 'zod';
import { mkConfig, generateCsv, asString } from 'export-to-csv';
import { AcceptedData } from 'export-to-csv/output/lib/types';

export interface ValidationResultCSV<R> {
  successRecords: R[];
  failedRecords: R[];
}

@Injectable()
export class CSVFileService extends BaseFileService {
  async createFile<T>(
    data: T[],
    fileName: string,
  ): Promise<Express.Multer.File> {
    // Convert data to CSV format
    const bufferCsvData = this.convertToCSV(data);
    const file: Express.Multer.File = {
      fieldname: fileName,
      originalname: `${fileName}-${Date.now()}.csv`,
      encoding: '7bit',
      mimetype: 'text/csv',
      size: bufferCsvData.length,
      buffer: bufferCsvData as unknown as Buffer,
      stream: null,
      destination: null,
      filename: `${fileName}-${Date.now()}.csv`,
      path: `${fileName}-${Date.now()}.csv`,
    };
    return file;
  }
  async validateFile<T, R>(
    file: Express.Multer.File,
    zodSchema: z.ZodType<T>,
  ): Promise<ValidationResultCSV<R>> {
    // Check if the file is a CSV
    if (file.mimetype !== 'text/csv') {
      throw new BadRequestException(
        'Invalid file type. Only CSV files are allowed.',
      );
    }

    // Parse the CSV file into records
    const records = await this.parseCSV(file);
    const recordsAfterCheckEmail = [];
    this.logger.info(records, 'Parsed records: ');

    // Check for duplicate emails in the file
    const failedRecords: R[] = [];
    const uniqueEmails = new Set();
    for (const record of records) {
      if (uniqueEmails.has(record.email)) {
        failedRecords.push({
          ...record,
          reason: 'Email already exists in your file',
        });
        continue;
      }
      uniqueEmails.add(record.email);
      recordsAfterCheckEmail.push(record);
    }
    const listEmail = Array.from(uniqueEmails) as string[];

    // Check for duplicate emails in system

    const existingEmails = (
      await this.userRepository.getUsersInListEmail(listEmail)
    ).map((user) => user.email);

    // Filter out records that are not in the system
    const validRecords = recordsAfterCheckEmail.filter((record) => {
      const isExistEmail = existingEmails.includes(record.email);

      if (isExistEmail) {
        failedRecords.push({
          ...record,
          reason: 'Email already exists in system',
        });
      }

      return !isExistEmail;
    });

    let successRecords: R[] = [];
    // Validate each record against the schema
    try {
      // Only include the fields defined in the schema and nothing else
      successRecords = (await zodSchema.parseAsync(validRecords)) as R[];
    } catch (error) {
      if (error instanceof z.ZodError) {
        for (const err of error.issues) {
          const rowNumber = Number(err.path[0]);
          const fieldErr = err.path[1];
          const row = recordsAfterCheckEmail[rowNumber];

          const reason = `${fieldErr} (${err.message})`;

          failedRecords[rowNumber] = {
            ...row,
            reason,
          };
        }
      }
    }

    return {
      successRecords,
      failedRecords,
    };
  }

  async parseCSV(file: Express.Multer.File): Promise<any[]> {
    // Parse CSV with headers
    const records = parse(file.buffer, {
      columns: true,
      trim: true,
      skipRecordsWithEmptyValues: true,
    });

    return records;
  }

  convertToCSV<T>(data: T[]): Uint8Array {
    const csvConfig = mkConfig({ useKeysAsHeaders: true });
    const csv = generateCsv(csvConfig)(
      data as {
        [key: string]: AcceptedData;
      }[],
    );
    return new Uint8Array(Buffer.from(asString(csv).trim()));
  }
}
