import * as ffmpeg from 'fluent-ffmpeg';
import * as ffprobeStatic from 'ffprobe-static';
import * as tmp from 'tmp';
import * as fs from 'fs';
import { BufferedVideoFile } from './file.model';
import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { MinioClient, MinioService } from 'nestjs-minio-client';
import { log } from 'console';

interface VideoMetadata {
  format: {
    duration: number;
  };
  streams: Array<{
    width: number;
    height: number;
  }>;
}

@Injectable()
export class MinioClientService {
  private readonly logger = new Logger(MinioClientService.name);
  private readonly baseBucket: string;
  private readonly client: MinioClient;
  private readonly minioEndpoint: string;
  private readonly minioPort: number;

  constructor(private readonly minio: MinioService) {
    this.baseBucket = process.env.S3_BUCKET_NAME;
    this.client = this.minio.client;
    this.minioEndpoint = process.env.STACKHERO_MINIO_HOST;
    this.minioPort = parseInt(process.env.MINIO_API_PORT, 10);

    this.logger.log('base bucket', this.baseBucket);
    this.logger.log('minio endpoint', this.minioEndpoint);
    this.logger.log('minio port', this.minioPort);

    this.logger.log('Setting up bucket');

    const createBucket = () => {
      this.client.makeBucket(this.baseBucket, 'us-east-1', (err) => {
        if (err) {
          throw new HttpException(
            'Error creating bucket ' + err,
            HttpStatus.BAD_REQUEST,
          );
        }
      });
    };

    this.logger.log('Checking if bucket exists', this.baseBucket);
    this.client.bucketExists(this.baseBucket, (err, exists) => {
      if (err) {
        this.logger.error('Error checking if bucket exists', err);
        throw new HttpException(
          'Error checking if bucket exists ' + err,
          HttpStatus.BAD_REQUEST,
        );
      }
      if (!exists) {
        console.log('Bucket does not exist, creating bucket');
        createBucket();
      }
    });

    const policy = {
      Version: '2012-10-17',
      Statement: [
        {
          Effect: 'Allow',
          Principal: {
            AWS: ['*'],
          },
          Action: [
            's3:ListBucketMultipartUploads',
            's3:GetBucketLocation',
            's3:ListBucket',
          ],
          Resource: [`arn:aws:s3:::${this.baseBucket}`],
        },
        {
          Effect: 'Allow',
          Principal: {
            AWS: ['*'],
          },
          Action: [
            's3:PutObject',
            's3:AbortMultipartUpload',
            's3:DeleteObject',
            's3:GetObject',
            's3:ListMultipartUploadParts',
          ],
          Resource: [`arn:aws:s3:::${this.baseBucket}/*`],
        },
      ],
    };

    console.log('Setting bucket policy');
    this.client.setBucketPolicy(
      this.baseBucket,
      JSON.stringify(policy),
      (err) => {
        if (err)
          throw new HttpException(
            'Error setting bucket policy ' + err,
            HttpStatus.BAD_REQUEST,
          );
      },
    );

    console.log('Bucket setup complete');
  }

  private generateFileName(originalFilename: string): string {
    const [name, extension] = originalFilename.split('.');
    const fileName = `${Date.now()}-${Math.round(
      Math.random() * 10_000,
    )}-${name}.${extension}`;

    return fileName.replaceAll(' ', '-');
  }

  public async upload(
    file: BufferedVideoFile,
    baseBucket: string = this.baseBucket,
  ) {
    this.logger.log('Uploading file to minio');

    if (
      !(
        file.mimetype === 'video/mp4' ||
        file.mimetype === 'video/avi' ||
        file.mimetype === 'video/mov'
      )
    ) {
      throw new HttpException('Error uploading file', HttpStatus.BAD_REQUEST);
    }

    const videoMetadata = await this.getVideoMetadata(file.buffer as Buffer);

    const metaData = {
      'Content-Type': file.mimetype,
      'X-Amz-Meta-Testing': 1234,
      'X-Amz-Meta-Duration': videoMetadata.format?.duration,
      'X-Amz-Meta-Resolution': `${videoMetadata.streams[0]?.width}x${videoMetadata.streams[0]?.height}`,
    };

    const fileName = this.generateFileName(file.originalname);
    const fileBuffer = file.buffer;
    const fileSize = file.size;

    this.client.putObject(
      baseBucket,
      fileName,
      fileBuffer,
      fileSize,
      metaData,
      function (err) {
        if (err)
          throw new HttpException(
            'Error uploading file' + err,
            HttpStatus.BAD_REQUEST,
          );
      },
    );

    return {
      url: `${this.minioEndpoint}:${this.minioPort}/${baseBucket}/${fileName}`,
    };
  }

  private async getVideoMetadata(fileBuffer: Buffer): Promise<VideoMetadata> {
    return new Promise((resolve, reject) => {
      tmp.file((err, path, fd, cleanupCallback) => {
        if (err) {
          reject(err);
          return;
        }

        const writeStream = fs.createWriteStream(path);
        writeStream.write(fileBuffer);
        writeStream.end();

        writeStream.on('finish', () => {
          ffmpeg.ffprobe(path, (err, metadata) => {
            cleanupCallback();
            if (err) {
              reject(err);
            } else {
              resolve(metadata as VideoMetadata);
            }
          });
        });
      });
    });
  }
}
