import { RecoverService } from './service/recover.service';
import { RecoverController } from './controller/recover.controller';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Recover, RecoverSchema } from './schema/recover.schema';
import { UserModule } from '../user/user.module';
import { ConfigModule } from '@nestjs/config';
import { CoreModule } from '../../core/core.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Recover.name,
        schema: RecoverSchema,
      },
    ]),
    UserModule,
    CoreModule,
    ConfigModule,
  ],
  controllers: [RecoverController],
  providers: [RecoverService],
})
export class RecoverModule {}
