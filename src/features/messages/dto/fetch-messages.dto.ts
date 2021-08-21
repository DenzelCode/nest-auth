import { Type } from 'class-transformer';
import { IsDate, IsNumber, IsOptional } from 'class-validator';

export class FetchMessagesDto {
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  limit = 30;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  before: Date;
}
