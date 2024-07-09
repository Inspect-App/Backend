import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Logger, ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors();

  const config = new DocumentBuilder()
    .setTitle('Inspect App API')
    .setDescription('This is the API documentation for the Inspect Mobile App.')
    .addBearerAuth()
    .setVersion('1.0')
    .build();

  app.useGlobalPipes(new ValidationPipe({
    transform: true,
  }))

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  Logger.log(`---------------------------------------`, 'Bootstrap');
  Logger.log(`---------------------------------------`, 'Bootstrap');
  Logger.log(`                                       `, 'Bootstrap');
  Logger.log(`Server running on http://localhost:3200`, 'Bootstrap');
  Logger.log(`                                       `, 'Bootstrap');
  Logger.log(`API running on http://localhost:3200/api`, 'Bootstrap');
  Logger.log(`                                       `, 'Bootstrap');
  Logger.log(`---------------------------------------`, 'Bootstrap');
  Logger.log(`---------------------------------------`, 'Bootstrap');

  await app.listen(3200);
}
bootstrap();
