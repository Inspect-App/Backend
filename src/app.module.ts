import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { PrismaService } from './prisma.service';
import { CustomConfigService } from './config/config.service';
import configuration from './config/configuration';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { MailerService } from './mailer/mailer.service';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { MinioClientModule } from './minio/minio-client.module';
import { FileUploadModule } from './files/upload/file-upload.module';
import { UsersModule } from './users/users.module';
import { FilesModule } from './files/files.module';
import { PurchaseService } from './purchase/purchase.service';
import { PurchaseController } from './purchase/purchase.controller';
import { PurchaseModule } from './purchase/purchase.module';
import { AwsService } from './files/upload/aws.service';
@Module({
  imports: [
    ConfigModule.forRoot({
      load: [configuration],
      isGlobal: true,
    }),
    AuthModule,
    // MinioClientModule,
    FileUploadModule,
    UsersModule,
    FilesModule,
    PurchaseModule,
  ],
  controllers: [AppController],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseInterceptor,
    },
    AppService,
    PrismaService,
    CustomConfigService,
    MailerService,
  ],
})
export class AppModule {
  configureSwagger(app: any) {
    const options = new DocumentBuilder()
      .setTitle('API Documentation')
      .setDescription('API description')
      .setVersion('1.0')
      .addBearerAuth()
      .build();
    const document = SwaggerModule.createDocument(app, options);
    SwaggerModule.setup('api', app, document);
  }
}
