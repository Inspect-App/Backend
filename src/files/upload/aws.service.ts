import { Injectable, Logger } from '@nestjs/common';
import * as AWS from 'aws-sdk';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class AwsService {
    private s3 = new AWS.S3({
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        region: process.env.AWS_REGION
    });

    constructor(private prismaService: PrismaService) {}

    async uploadFile(file: Express.Multer.File, bucket: string, id: number): Promise<AWS.S3.ManagedUpload.SendData> {
        try {
          // Logging details about the file being uploaded
          Logger.log('Starting upload...');
    
          // Constructing the parameters for S3 upload
          const params = {
            Bucket: bucket,
            Key: `${Date.now()}-${file.originalname}`,
            Body: file.buffer,
            ContentType: file.mimetype,
          };
    
          // Uploading to S3
          const result = await this.s3.upload(params).promise();
          Logger.log('Upload successful');
          await this.prismaService.file.create({
            data: {
                title: file.originalname,
                path: result.Location,
                duration: 6,
                userId: Number(id),
            },
            include: {
                user: true,
            }

          })
    
          return result;
        } catch (error) {
          // Log the error if upload fails
          Logger.error('Error uploading file to S3:', error);
          throw new Error('Failed to upload file to S3');
        }
      }
}
