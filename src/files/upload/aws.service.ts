import { Injectable, Logger } from '@nestjs/common';
import * as AWS from 'aws-sdk';
import { PrismaService } from 'src/prisma.service';
import * as ffmpeg from 'fluent-ffmpeg';
import * as tmp from 'tmp';
import * as fs from 'fs';

@Injectable()
export class AwsService {
    private s3: AWS.S3;

    constructor(private prismaService: PrismaService) {
        // Always use AWS S3 configuration for better public access
        this.s3 = new AWS.S3({
            accessKeyId: process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
            region: process.env.AWS_REGION || 'us-east-1'
        });
        Logger.log('Using AWS S3 for storage');
    }

    async uploadFile(file: Express.Multer.File, bucket: string, id: number): Promise<AWS.S3.ManagedUpload.SendData> {
        try {
          // Logging details about the file being uploaded
          Logger.log('Starting upload...');
          Logger.log(`Original filename: ${file.originalname}, mimetype: ${file.mimetype}`);
    
          // Use the bucket name from environment variables
          const bucketName = process.env.S3_BUCKET_NAME;
          if (!bucketName) {
            throw new Error('S3_BUCKET_NAME environment variable is not set');
          }
    
          // Extract the file extension from the original name or use the mimetype to determine it
          let fileExtension = '';
          if (file.originalname.includes('.')) {
            fileExtension = file.originalname.split('.').pop();
          } else {
            // If no extension in the original name, determine from mimetype
            switch (file.mimetype) {
              case 'video/mp4':
                fileExtension = 'mp4';
                break;
              case 'video/quicktime':
                fileExtension = 'mov';
                break;
              case 'video/x-msvideo':
                fileExtension = 'avi';
                break;
              default:
                fileExtension = 'mp4'; // Default to mp4 if unknown
            }
          }
          
          // Ensure we're not using .temp extension
          if (fileExtension === 'temp') {
            fileExtension = 'mp4';
          }
          
          // Create a proper filename with timestamp and correct extension
          const fileName = `${Date.now()}-${file.originalname.split('.')[0]}.${fileExtension}`;
          
          // Transcode the video to ensure web compatibility
          const transcodedBuffer = await this.transcodeVideo(file.buffer);
          
          // Constructing the parameters for S3 upload with public-read ACL
          const params = {
            Bucket: bucketName,
            Key: fileName,
            Body: transcodedBuffer,
            ContentType: 'video/mp4', // Always set to mp4 after transcoding
            ACL: 'public-read', // Make the file publicly accessible
          };
    
          Logger.log(`Uploading to bucket: ${bucketName} with filename: ${fileName}`);
          
          // Uploading to S3
          const result = await this.s3.upload(params).promise();
          Logger.log('Upload successful');
          
          // Get the public URL directly from S3
          const publicUrl = result.Location;
          Logger.log(`File public URL: ${publicUrl}`);

          // Ensure we have a valid user ID
          const userId = id ? Number(id) : null;
          if (!userId || isNaN(userId)) {
            Logger.warn('Invalid or missing user ID, using default user ID 1');
            // If no valid user ID is provided, use a default (e.g., 1)
            // This is a fallback to prevent errors
            await this.prismaService.file.create({
              data: {
                title: `${file.originalname.split('.')[0]}.mp4`, // Always use .mp4 after transcoding
                path: publicUrl,
                duration: 6,
                userId: 1, // Default user ID
              }
            });
          } else {
            // Create file with valid user ID
            await this.prismaService.file.create({
              data: {
                title: `${file.originalname.split('.')[0]}.mp4`, // Always use .mp4 after transcoding
                path: publicUrl,
                duration: 6,
                userId: userId,
              }
            });
          }
    
          return result;
        } catch (error) {
          // Log the error if upload fails
          Logger.error('Error uploading file to S3:', error);
          throw new Error('Failed to upload file to S3');
        }
      }
      
      // Transcode video to ensure web compatibility
      private async transcodeVideo(buffer: Buffer): Promise<Buffer> {
        return new Promise((resolve, reject) => {
          // Create temporary input file
          const inputFile = tmp.fileSync({ postfix: '.mp4' });
          fs.writeFileSync(inputFile.name, buffer);
          
          // Create temporary output file
          const outputFile = tmp.fileSync({ postfix: '.mp4' });
          
          Logger.log('Transcoding video to ensure web compatibility...');
          
          // Use ffmpeg to transcode the video
          ffmpeg(inputFile.name)
            .outputOptions([
              '-c:v libx264',     // Use H.264 codec for video
              '-crf 23',          // Constant Rate Factor (quality)
              '-preset fast',     // Encoding speed/compression ratio
              '-c:a aac',         // Use AAC codec for audio
              '-b:a 128k',        // Audio bitrate
              '-movflags +faststart', // Optimize for web streaming
              '-pix_fmt yuv420p', // Pixel format for maximum compatibility
            ])
            .output(outputFile.name)
            .on('end', () => {
              Logger.log('Transcoding completed successfully');
              // Read the transcoded file
              const transcodedBuffer = fs.readFileSync(outputFile.name);
              
              // Clean up temporary files
              inputFile.removeCallback();
              outputFile.removeCallback();
              
              resolve(transcodedBuffer);
            })
            .on('error', (err) => {
              Logger.error('Error during transcoding:', err);
              
              // Clean up temporary files
              inputFile.removeCallback();
              outputFile.removeCallback();
              
              // If transcoding fails, return the original buffer
              Logger.log('Transcoding failed, using original video');
              resolve(buffer);
            })
            .run();
        });
      }
}
