import { Module } from '@nestjs/common';
import { CSVFileService } from './service/csv-file.service';
import { ProviderModule } from 'src/provider/provider.module';
import { UserRepository } from '../user/repository/user.repository';

@Module({
  imports: [ProviderModule],
  providers: [CSVFileService, UserRepository],
  exports: [CSVFileService],
})
export class FileModule {}
