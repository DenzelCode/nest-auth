import { IsMongoId, IsOptional } from 'class-validator';

export class DeleteRoomMessageDto {
  @IsOptional()
  @IsMongoId()
  messageId?: string;

  @IsMongoId()
  roomId: string;
}
