import { AuthController } from './controller/auth.controller';
import { AuthService } from './service/auth.service';
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { UserModule } from '../user/user.module';
import { JwtStrategy } from './strategy/jwt.strategy';
import { LocalStrategy } from './strategy/local.strategy';
import { JwtAuthGuard } from './guard/jwt-auth.guard';
import { LocalAuthGuard } from './guard/local-auth.guard';
import { GlobalConfig } from 'src/common/types/global-config';
import { Dictionary } from 'code-config';

@Module({
  imports: [
    ConfigModule,
    PassportModule.register({
      defaultStrategy: JwtStrategy.strategyName,
      property: 'user',
    }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService<GlobalConfig>) => {
        const signOptions: Dictionary = {};

        const expiration = configService.get('ACCESS_TOKEN_EXPIRATION');

        if (expiration) {
          signOptions.expiresIn = expiration;
        }

        return {
          secret: configService.get('ACCESS_TOKEN_SECRET'),
          signOptions: signOptions,
        };
      },
    }),
    UserModule,
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    JwtAuthGuard,
    LocalStrategy,
    LocalAuthGuard,
  ],
  exports: [JwtAuthGuard, LocalAuthGuard],
})
export class AuthModule {}
