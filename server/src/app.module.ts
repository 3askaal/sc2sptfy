import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { CacheModule } from '@nestjs/cache-manager';
import { BullModule } from '@nestjs/bull';
import { AppService } from './app.service';
import { AppController } from './app.controller';
import { AppConsumer } from './app.consumer';
import { URL } from 'url';

const RedisUrl = new URL(process.env.REDIS_URI);

@Module({
  imports: [
    BullModule.forRoot({
      redis: {
        host: RedisUrl.hostname,
        port: Number(RedisUrl.port),
        username: RedisUrl.username,
        password: RedisUrl.password,
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
