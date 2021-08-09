import { IsMongoId } from 'class-validator';

export class RoomIdDto {
  @IsMongoId()
  roomId: string;
}
