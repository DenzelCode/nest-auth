import { IsMongoId } from 'class-validator';

export class DeleteDirectMessageDto {
  @IsMongoId()
  to: string;

  @IsMongoId()
  messageId?: string;
}
