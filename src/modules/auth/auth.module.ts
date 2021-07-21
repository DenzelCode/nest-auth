import { AuthController } from './controller/auth.controller';
import { AuthService } from './service/auth.service';
import { forwardRef, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UserModule } from '../user/user.module';
import { JwtAuthGuard } from './guard/jwt-auth.guard';
import { FacebookAuthModule } from 'facebook-auth-nestjs';
import { GlobalConfig } from 'src/common/types/global-config';

@Module({
  imports: [
    ConfigModule,
    JwtModule.register({}),
    forwardRef(() => UserModule),
    FacebookAuthModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService<GlobalConfig>) => ({
        clientId: configService.get('FACEBOOK_APP_ID'),
        clientSecret: configService.get('FACEBOOK_APP_SECRET'),
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtAuthGuard],
  exports: [JwtAuthGuard, AuthService, JwtModule, ConfigModule],
})
export class AuthModule {}
