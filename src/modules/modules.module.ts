import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { TaskModule } from './task/task.module';
import { UserModule } from './user/user.module';

@Module({
  imports: [AuthModule, UserModule, TaskModule],
  controllers: [],
  exports: [AuthModule, UserModule, TaskModule],
})
export class ModulesModule {}
