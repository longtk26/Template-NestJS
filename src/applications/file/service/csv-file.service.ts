import { BadRequestException, Injectable } from '@nestjs/common';
import { BaseFileService } from './base-file.service';
import { TOptionValidateFile } from '../types/file.type';
import { EAcceptMimeFile } from '../constants/file.constant';

@Injectable()
export class CSVFileService extends BaseFileService {
  validateFile = (
    file: Express.Multer.File,
    option: TOptionValidateFile = {},
  ) => {
    if (!file || !file.buffer) {
      throw new BadRequestException('File is required');
    }

    if (
      file.mimetype !== EAcceptMimeFile.CSV &&
      file.mimetype !== 'application/csv'
    ) {
      throw new BadRequestException('Invalid file type');
    }

    if (!file.originalname.toLowerCase().endsWith('.csv')) {
      throw new BadRequestException('Invalid file extension');
    }

    if (file.size === 0 || !file.buffer.length) {
      throw new BadRequestException('File is empty');
    }

    if (option.maxSize && file.size > option.maxSize) {
      throw new BadRequestException(
        `File size exceeds the maximum limit of ${option.maxSize} bytes.`,
      );
    }
  };
}
