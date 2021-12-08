import {
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class UpdatePasswordDto {
  @IsOptional()
  @IsString()
  currentPassword?: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  @MaxLength(60)
  password: string;

  @IsNotEmpty()
  @IsString()
  confirmPassword: string;
}
