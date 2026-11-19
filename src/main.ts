import { NestFactory, Reflector } from '@nestjs/core';
import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors();

  // Валидация входных DTO
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: false,
    }),
  );

  // Автоматическое исключение полей с декоратором @Exclude() (например, password)
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));

  // ЛР 19: Динамический порт из переменной окружения PORT (для Render и Docker) или 3000 по умолчанию
  const port = process.env.PORT || 3000;
  await app.listen(port, '0.0.0.0');
  console.log(`Application is running on: http://0.0.0.0:${port}`);
}
bootstrap();
