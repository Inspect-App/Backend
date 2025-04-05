import { ApiBody, ApiConsumes } from '@nestjs/swagger';
import {
  Body,
  Controller,
  Logger,
  Post,
  UploadedFile,
  UseInterceptors,
  Request,
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
        id: {
          type: 'number',
          description: 'User ID',
        },
      },
    },
  })
  @UseInterceptors(FileInterceptor('video'))
  async uploadSingle(@UploadedFile() video: Express.Multer.File, @Body('id') id: string) {
    if (!video) {
      console.error('No file uploaded');
      throw new Error('No file uploaded');
    }
    
    Logger.log(`Received file: ${video.originalname} for user ID: ${id || 'unknown'}`);
    
    // Convert id to number or use null if not provided
    const userId = id ? parseInt(id, 10) : null;
    
    // Pass the user ID to the upload service
    const result = await this.awsService.uploadFile(video, null, userId);
    return { url: result.Location };
  }
}
