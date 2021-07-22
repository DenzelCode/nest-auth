import { AuthController } from './controller/auth.controller';
import { AuthService } from './service/auth.service';
import { forwardRef, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UserModule } from '../user/user.module';
import { JwtAuthGuard } from './guard/jwt-auth.guard';
import { FacebookAuthModule } from 'facebook-auth-nestjs';
import { authSecretsConfig } from './config/auth-secrets.config';
import { GoogleAuthService } from './service/google-auth.service';

const facebook = authSecretsConfig.facebook;

@Module({
  imports: [
    ConfigModule,
    JwtModule.register(null),
    forwardRef(() => UserModule),
    FacebookAuthModule.forRoot({
      clientId: facebook.appId as number,
      clientSecret: facebook.appSecret,
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtAuthGuard, GoogleAuthService],
  exports: [JwtAuthGuard, AuthService, JwtModule, ConfigModule],
})
export class AuthModule {}
