import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { CacheModule } from '@nestjs/cache-manager';
import { MongooseModule } from '@nestjs/mongoose';
import { BullModule } from '@nestjs/bull';
import { ConfigModule } from '@nestjs/config';
import { URL } from 'url';
import { AppService } from './app.service';
import { AppController } from './app.controller';
import { AppConsumer } from './app.consumer';
import { Generation, GenerationSchema } from './app.schema';
import { CONFIG, NEST_CONFIG } from '../config';

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
    ConfigModule.forRoot({
      load: [NEST_CONFIG],
    }),
    BullModule.forRoot({
      redis: redisConfig(),
    }),
    BullModule.registerQueue({
      name: 'generation',
    }),
    MongooseModule.forRoot(CONFIG.MONGODB_URI),
    MongooseModule.forFeature([
      { name: Generation.name, schema: GenerationSchema },
    ]),
    HttpModule,
    CacheModule.register(),
  ],
  controllers: [AppController],
  providers: [AppService, AppConsumer],
})
export class AppModule {}
