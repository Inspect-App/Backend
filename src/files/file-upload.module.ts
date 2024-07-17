import { FileUploadController } from "./file-upload.controller";
import { FileUploadService } from "./file-upload.service";
import { MinioClientModule } from "../minio/minio-client.module";
import { Module } from "@nestjs/common";

@Module({
  imports: [MinioClientModule],
  providers: [FileUploadService],
  controllers: [FileUploadController],
})
export class FileUploadModule {}
