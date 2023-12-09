import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { CONFIG } from 'config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    allowedHeaders: ['content-type'],
    origin: ['http://localhost:3000', 'https://sc2sptfy.vercel.app'],
    credentials: true,
  });

  await app.listen(CONFIG.PORT);
}

bootstrap();
