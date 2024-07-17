import { ConfigService } from '@nestjs/config';
import { MinioClientService } from './minio-client.service';
import { MinioModule } from 'nestjs-minio-client';
import { Module } from '@nestjs/common';

@Module({
  imports: [
    MinioModule.registerAsync({
      useFactory: () => {
        console.log(
          'process.env.STACKHERO_MINIO_HOST',
          process.env.STACKHERO_MINIO_HOST,
        );
        console.log('process.env.MINIO_PORT', process.env.MINIO_API_PORT);
        console.log(
          'process.env.MINIO_ACCESS_KEY',
          process.env.MINIO_ACCESS_KEY,
        );
        console.log(
          'process.env.MINIO_SECRET_KEY',
          process.env.MINIO_SECRET_KEY,
        );
        return {
          endPoint: process.env.STACKHERO_MINIO_HOST,
          port: parseInt(process.env.MINIO_API_PORT),
          useSSL: false,
          accessKey: process.env.STACKHERO_MINIO_ACCESS_KEY,
          secretKey: process.env.STACKHERO_MINIO_SECRET_KEY,
        };
      },
      inject: [ConfigService],
    }),
  ],
  providers: [MinioClientService],
  exports: [MinioClientService],
})
export class MinioClientModule {}
