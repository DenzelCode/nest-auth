import { Module } from '@nestjs/common';
import { ParseObjectIdPipe } from './pipe/parse-object-id.pipe';

@Module({
  imports: [],
  controllers: [],
  providers: [ParseObjectIdPipe],
  exports: [ParseObjectIdPipe],
})
export class SharedModule {}
