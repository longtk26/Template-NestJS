import { parse } from 'csv-parse/sync';
import { asString, generateCsv, mkConfig } from 'export-to-csv';
import { AcceptedData } from 'export-to-csv/output/lib/types';
import { Readable } from 'stream';
import { TAcceptFile, TOptionValidateFile } from '../types/file.type';
import { BadRequestException } from '@nestjs/common';
import { EAcceptMimeFile } from '../constants/file.constant';

export abstract class BaseFileService {
  readFile<T>(file: Express.Multer.File, type: TAcceptFile): T {
    switch (EAcceptMimeFile[type]) {
      case EAcceptMimeFile.CSV:
        return this.readCsvFile<T>(file);
      default:
        throw new BadRequestException('Unsupported file type');
    }
  }
  writeFile<T>(
    data: T,
    fileName: string,
    type: TAcceptFile,
  ): Express.Multer.File {
    switch (EAcceptMimeFile[type]) {
      case EAcceptMimeFile.CSV:
        return this.writeCsvFile<T>(data, fileName);
      default:
        throw new BadRequestException('Unsupported file type');
    }
  }

  abstract validateFile: (
    file: Express.Multer.File,
    option: TOptionValidateFile,
  ) => void;

  private readCsvFile<T>(file: Express.Multer.File): T {
    const data = parse(file.buffer, {
      columns: true,
      trim: true,
      skipRecordsWithEmptyValues: true,
    });
    return data as T;
  }

  private writeCsvFile<T>(data: T, fileName: string): Express.Multer.File {
    const csvConfig = mkConfig({ useKeysAsHeaders: true });
    const csv = generateCsv(csvConfig)(
      data as {
        [key: string]: AcceptedData;
      }[],
    );
    const bufferCsv = Buffer.from(asString(csv).trim());

    const file: Express.Multer.File = {
      fieldname: fileName,
      originalname: `${fileName}.csv`,
      path: `${fileName}.csv`,
      encoding: '7bit',
      mimetype: EAcceptMimeFile.CSV,
      size: bufferCsv.length,
      buffer: bufferCsv,
      stream: new Readable({
        read() {
          this.push(null);
        },
      }),
      destination: '',
      filename: `${fileName}.csv`,
    };
    return file;
  }
}
