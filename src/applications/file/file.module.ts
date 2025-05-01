import { Module } from '@nestjs/common';
import { CSVFileService } from './service/csv-file.service';

@Module({
  imports: [],
  providers: [CSVFileService],
  exports: [CSVFileService],
})
export class FileModule {}
