import { RecoverService } from './service/recover.service';
import { RecoverController } from './controller/recover.controller';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Recover, RecoverSchema } from './schema/recover.schema';
import { ConfigModule } from '@nestjs/config';
import { CoreModule } from '../../core/core.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Recover.name,
        schema: RecoverSchema,
      },
    ]),
    AuthModule,
    CoreModule,
    ConfigModule,
  ],
  controllers: [RecoverController],
  providers: [RecoverService],
})
export class RecoverModule {}
