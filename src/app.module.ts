import { FeaturesModule } from './features/features.module';
import { CoreModule } from './core/core.module';
import { CommonModule } from './shared/shared.module';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { AppGateway } from './app.gateway';
import { GlobalConfig } from './shared/types/global-config';

@Module({
  imports: [
    FeaturesModule,
    CoreModule,
    CommonModule,
    ConfigModule.forRoot(),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService<GlobalConfig>) => ({
        uri: configService.get('MONGO_URI'),
        autoIndex: false,
        useFindAndModify: false,
      }),
    }),
  ],
  controllers: [AppController],
  providers: [AppGateway],
})
export class AppModule {}
