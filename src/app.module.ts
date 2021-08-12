import { FeaturesModule } from './features/features.module';
import { CoreModule } from './core/core.module';
import { CommonModule } from './shared/shared.module';
import { Module, ValidationPipe } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { GlobalConfig } from './shared/types/global-config';
import { APP_FILTER, APP_PIPE } from '@nestjs/core';
import { ExceptionsFilter } from './core/filter/exception.filter';

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
  providers: [
    {
      provide: APP_PIPE,
      useClass: ValidationPipe,
    },
    {
      provide: APP_FILTER,
      useClass: ExceptionsFilter,
    },
  ],
  controllers: [AppController],
})
export class AppModule {}
