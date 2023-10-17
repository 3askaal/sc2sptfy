import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { CacheModule } from '@nestjs/cache-manager';
import { BullModule } from '@nestjs/bull';
import { ConfigModule } from '@nestjs/config';
import { AppService } from './app.service';
import { AppController } from './app.controller';
import { AppConsumer } from './app.consumer';
import { URL } from 'url';

const redisConfig = () => {
  if (process.env.NODE_ENV === 'production') {
    const RedisUrl = new URL(process.env.REDIS_URI);

    return {
      host: RedisUrl.hostname,
      port: Number(RedisUrl.port),
      username: RedisUrl.username,
      password: RedisUrl.password,
    };
  }

  return {
    host: 'localhost',
    port: 6379,
  };
};

@Module({
  imports: [
    ConfigModule.forRoot(),
    BullModule.forRoot({
      redis: redisConfig(),
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
