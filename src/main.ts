import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { join } from 'path';
import { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  // Включаем CORS для конкретного домена
  app.enableCors({
    origin: 'http://127.0.0.1:5500', // Разрешить запросы только с этого домена
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    preflightContinue: false,
    optionsSuccessStatus: 204,
  });
  // Настройте путь к статическим файлам
  app.useStaticAssets(join(__dirname, '..', 'client')); // теперь по адресу http://localhost:3000/ будет отрываться index.html
  await app.listen(3000);
}
bootstrap();