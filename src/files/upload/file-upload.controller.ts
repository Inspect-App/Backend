import { ApiBody, ApiConsumes } from '@nestjs/swagger';
import { BufferedVideoFile } from '../../minio/file.model';
import {
  Controller,
  HttpException,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { FileUploadService } from './file-upload.service';
import { Throttle } from '@nestjs/throttler';

@Controller('file-upload')
export class FileUploadController {
  constructor(private fileUploadService: FileUploadService) {}

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
  async uploadSingle(@UploadedFile() video: BufferedVideoFile) {
    if (!video) throw new HttpException('Video is required', 400);
    return await this.fileUploadService.uploadSingle(video);
  }
}
