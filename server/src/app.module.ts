import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { HttpModule } from '@nestjs/axios';
import { CacheModule } from '@nestjs/cache-manager';
import { AppService } from './app.service';
import { DocumentSchema } from './app.schema';
import { AppController } from './app.controller';
import { CONFIG } from '../config';

@Module({
  imports: [
    MongooseModule.forRoot(CONFIG.MONGODB_URI),
    MongooseModule.forFeature([
      { name: Document.name, schema: DocumentSchema },
    ]),
    HttpModule,
    CacheModule.register(),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
