import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { useContainer } from 'class-validator';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

import { AppModule } from './app.module';


const API_VERSION = '1';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const globalPrefix = `api/v${API_VERSION}`;
  app.setGlobalPrefix(globalPrefix);

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    })
  );

  useContainer(app.select(AppModule), { fallbackOnErrors: true });

  const config = new DocumentBuilder()
    .setTitle('Travel App')
    .setDescription('The Travel App API')
    .setVersion(API_VERSION)
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup(globalPrefix + '/swagger', app, documentFactory);

  const port = process.env.PORT || 4000;
  await app.listen(port);

  Logger.log(
    `🚀 Application is running on: http://localhost:${port}/${globalPrefix}`
  );
}

bootstrap();
