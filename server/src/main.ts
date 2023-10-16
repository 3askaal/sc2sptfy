import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    allowedHeaders: ['content-type'],
    origin: ['http://localhost:3000', 'https://sc2sptfy.vercel.app'],
    credentials: true,
  });

  await app.listen(process.env.PORT || 1337);
}

bootstrap();
