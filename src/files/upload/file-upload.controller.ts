import { ApiBody, ApiConsumes } from '@nestjs/swagger';
import {
  Body,
  Controller,
  Logger,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Throttle } from '@nestjs/throttler';
import { AwsService } from 'src/files/upload/aws.service';

@Controller('file-upload')
export class FileUploadController {
  constructor(private readonly awsService: AwsService) {}

  @Post('single')
  @Throttle({
    default: {
      limit: 15,
      ttl: 60,
    },
  }) // 15 requests per minute
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        video: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @UseInterceptors(FileInterceptor('video'))
  async uploadSingle(@UploadedFile() video: Express.Multer.File, @Body('id') id: number) {
    Logger.log('Received file:', video.originalname);
  if (!video) {
    console.error('No file uploaded');
    throw new Error('No file uploaded');
  }
    const bucket = process.env.AWS_S3_BUCKET_NAME;
    const result = await this.awsService.uploadFile(video, bucket, id);
    return { url: result.Location };
  }
}
