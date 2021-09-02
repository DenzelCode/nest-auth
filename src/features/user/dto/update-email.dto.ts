import { IsEmail } from 'class-validator';

export class UpdateEmailDto {
  @IsEmail()
  email: string;
}
