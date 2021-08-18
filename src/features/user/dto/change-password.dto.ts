import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class ChangePasswordDto {
  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  @MaxLength(60)
  password: string;

  @IsNotEmpty()
  @IsString()
  confirmPassword: string;
}
