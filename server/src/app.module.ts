import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { HttpModule } from '@nestjs/axios';
import { CacheModule } from '@nestjs/cache-manager';
import { BullModule } from '@nestjs/bull';
import { AppService } from './app.service';
import { Document, DocumentSchema } from './app.schema';
import { AppController } from './app.controller';
import { CONFIG } from '../config';
import { AppConsumer } from './app.consumer';

@Module({
  imports: [
    MongooseModule.forRoot(CONFIG.MONGODB_URI),
    MongooseModule.forFeature([
      { name: Document.name, schema: DocumentSchema },
    ]),
    BullModule.forRoot({
      redis: {
        host: 'localhost',
        port: 6379,
      },
    }),
    BullModule.registerQueue({
      name: 'generation',
    }),
    HttpModule,
    CacheModule.register(),
  ],
  controllers: [AppController],
  providers: [AppService, AppConsumer],
})
export class AppModule {}
