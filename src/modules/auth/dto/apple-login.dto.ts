import { IsNotEmpty, IsString } from 'class-validator';

export class AppleLoginDto {
  @IsNotEmpty()
  @IsString()
  name?: string;

  @IsNotEmpty()
  @IsString()
  accessToken: string;

  @IsNotEmpty()
  @IsString()
  authorizationCode: string;
}
