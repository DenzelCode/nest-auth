import { IsMongoId } from 'class-validator';

export class DeleteRoomMessageDto {
  @IsMongoId()
  messageId?: string;

  @IsMongoId()
  roomId: string;
}
