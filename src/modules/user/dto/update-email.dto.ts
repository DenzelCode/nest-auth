import { IsEmail, IsString } from 'class-validator';

export class UpdateEmailDto {
  @IsString()
  @IsEmail()
  email: string;
}
