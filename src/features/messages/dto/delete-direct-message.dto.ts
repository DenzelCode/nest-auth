import { IsMongoId, IsOptional } from 'class-validator';

export class DeleteDirectMessageDto {
  @IsMongoId()
  to: string;

  @IsOptional()
  @IsMongoId()
  messageId?: string;
}
