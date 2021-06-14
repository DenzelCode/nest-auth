import { IsEmail, IsString } from 'class-validator';

export class RecoverPasswordDto {
  @IsString()
  @IsEmail()
  email: string;
}
