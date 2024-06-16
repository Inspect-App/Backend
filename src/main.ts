import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  const config = new DocumentBuilder()
    .setTitle('Inspect App API')
    .setDescription('This is the API documentation for the Inspect Mobile App.')
    .setVersion('1.0')
    .build();
    
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  Logger.log(`---------------------------------------`, 'Bootstrap');
  Logger.log(`                                       `, 'Bootstrap');
  Logger.log(`Server running on http://localhost:3200`, 'Bootstrap');
  Logger.log(`                                       `, 'Bootstrap');
  Logger.log(`API running on http://localhost:3200/api`, 'Bootstrap');
  Logger.log(`                                       `, 'Bootstrap');
  Logger.log(`---------------------------------------`, 'Bootstrap');

  
  await app.listen(3200);
}
bootstrap();
