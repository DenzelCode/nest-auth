import { AuthController } from './controller/auth.controller';
import { AuthService } from './service/auth.service';
import { forwardRef, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { UserModule } from '../user/user.module';
import { JwtAuthGuard } from './guard/jwt-auth.guard';
import { FacebookAuthModule } from 'facebook-auth-nestjs';
import { authConfig } from './config/auth.config';
import { GoogleAuthService } from './service/google-auth.service';
import { AppleAuthService } from './service/apple-auth.service';

const facebook = authConfig.facebook;

@Module({
  imports: [
    ConfigModule,
    JwtModule.register(null),
    UserModule,
    FacebookAuthModule.forRoot({
      clientId: facebook.appId as number,
      clientSecret: facebook.appSecret,
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtAuthGuard, GoogleAuthService, AppleAuthService],
  exports: [JwtAuthGuard, AuthService, JwtModule, ConfigModule, UserModule],
})
export class AuthModule {}
