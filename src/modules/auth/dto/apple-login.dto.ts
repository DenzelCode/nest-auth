import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class AppleLoginDto {
  @IsOptional()
  @IsNotEmpty()
  @IsString()
  name?: string;

  @IsOptional()
  @IsNotEmpty()
  @IsString()
  accessToken?: string;

  @IsOptional()
  @IsNotEmpty()
  @IsString()
  authorizationCode?: string;

  @IsOptional()
  @IsNotEmpty()
  @IsString()
  type?: 'web' | 'ios' | 'android';
}
