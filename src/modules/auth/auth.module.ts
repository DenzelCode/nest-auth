import { AuthController } from './controller/auth.controller';
import { AuthService } from './service/auth.service';
import { forwardRef, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { UserModule } from '../user/user.module';
import { JwtAuthGuard } from './guard/jwt-auth.guard';

@Module({
  imports: [ConfigModule, JwtModule.register({}), forwardRef(() => UserModule)],
  controllers: [AuthController],
  providers: [AuthService, JwtAuthGuard],
  exports: [JwtAuthGuard, AuthService, JwtModule, ConfigModule],
})
export class AuthModule {}
