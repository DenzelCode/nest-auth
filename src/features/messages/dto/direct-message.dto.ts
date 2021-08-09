import { IsMongoId, IsString, MaxLength } from 'class-validator';

export class DirectMessageDto {
  @IsString()
  @MaxLength(2000)
  message: string;

  @IsMongoId()
  to: string;
}
