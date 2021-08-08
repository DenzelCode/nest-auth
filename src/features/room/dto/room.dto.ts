import { IsBoolean, IsNotEmpty, IsString } from 'class-validator';

export class RoomDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsNotEmpty()
  @IsBoolean()
  isPublic: boolean;
}
