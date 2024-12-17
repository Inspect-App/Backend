import { FileUploadController } from "./file-upload.controller";
import { Module } from "@nestjs/common";
import { AwsService } from "./aws.service";
import { PrismaService } from "src/prisma.service";

@Module({
  providers: [AwsService, PrismaService],
  controllers: [FileUploadController],
})
export class FileUploadModule {}
