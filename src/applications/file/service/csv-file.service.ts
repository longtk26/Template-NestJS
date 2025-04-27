import { BaseFileService } from './base-file.service';
import { Injectable } from '@nestjs/common';
import { parse } from 'csv-parse/sync';
import { z, ZodIssue } from 'zod';

export interface ValidationResultCSV<T> {
  successRecords: T[];
  failedRecords: T[];
}

@Injectable()
export class CSVFileService extends BaseFileService {
  async createFile<T>(
    data: T[],
    fileName: string,
  ): Promise<Express.Multer.File> {
    // Convert data to CSV format
    const csvData = this.convertToCSV(data);
    const bufferCsvData = Buffer.from(csvData);
    const file: Express.Multer.File = {
      fieldname: fileName,
      originalname: `${fileName}-${Date.now()}.csv`,
      encoding: '7bit',
      mimetype: 'text/csv',
      size: bufferCsvData.length,
      buffer: bufferCsvData,
      stream: null,
      destination: null,
      filename: `${fileName}-${Date.now()}.csv`,
      path: `${fileName}-${Date.now()}.csv`,
    };
    return file;
  }
  async validateFile<T>(
    file: Express.Multer.File,
    zodSchema: z.ZodType<T>,
  ): Promise<ValidationResultCSV<T>> {
    // Check if the file is a CSV
    if (file.mimetype !== 'text/csv') {
      throw new Error('Invalid file type. Only CSV files are allowed.');
    }

    // Parse the CSV file into records
    const records = await this.parseCSV(file);
    const listEmail = records.map((record) => record.email);

    // Check for duplicate emails in database
    const existingEmails = (
      await this.userRepository.getUsersInListEmail(listEmail)
    ).map((user) => user.email);

    // Validate records against the provided Zod schema
    const successRecords: T[] = [];
    const failedRecords: T[] = [];
    const validRecords = records.filter((record) => {
      const isNotExistEmail = !existingEmails.includes(record.email);

      if (!isNotExistEmail) {
        failedRecords.push({
          ...record,
          reason: 'Email already exists',
        });
      }

      return isNotExistEmail;
    });

    // Validate each record against the schema
    for (const record of validRecords) {
      try {
        const validatedRecord = await zodSchema.parseAsync(record);
        const successRecord = {
          ...validatedRecord,
          password: '123',
        };
        successRecords.push(successRecord);
      } catch (error) {
        if (error instanceof z.ZodError) {
          failedRecords.push({
            ...record,
            reason: error.errors.reduce((acc: string, issue: ZodIssue) => {
              return `${acc}${issue.path.join('.')} - ${issue.message}\n`;
            }, ''),
          });
        } else {
          failedRecords.push({
            ...record,
            reason: 'Invalid data format',
          });
        }
      }
    }

    return {
      successRecords,
      failedRecords,
    };
  }

  async parseCSV(file: Express.Multer.File): Promise<any[]> {
    const fileContent = file.buffer.toString('utf8');

    // Parse CSV with headers
    const records = parse(fileContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    });

    return records;
  }

  convertToCSV<T>(data: T[]): string {
    const headers = Object.keys(data[0]);
    const csvRows = [
      headers.join(','), // Header row
      ...data.map((row: any) => headers.map((header) => row[header]).join(',')), // Data rows
    ];

    return csvRows.join('\n');
  }
}
