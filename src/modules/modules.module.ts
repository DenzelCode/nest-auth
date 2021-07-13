import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { RecoverModule } from './recover/recover.module';
import { TaskModule } from './task/task.module';
import { UserModule } from './user/user.module';

@Module({
  imports: [AuthModule, UserModule, TaskModule, RecoverModule],
  controllers: [],
  exports: [AuthModule, UserModule, TaskModule, RecoverModule],
})
export class ModulesModule {}
