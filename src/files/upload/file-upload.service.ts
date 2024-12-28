import { BufferedVideoFile } from "../../minio/file.model";
import { Injectable } from "@nestjs/common";
import { MinioClientService } from "../../minio/minio-client.service";

@Injectable()
export class FileUploadService {
  constructor(private minioClientService: MinioClientService) {}

  /**
   * Uploads a single video file to MinIO S3
   * @param video
   * @returns {Promise<{video_url: string, message: string}>}
   */
  async uploadSingle(video: BufferedVideoFile) {
    const uploaded_video = await this.minioClientService.upload(video);

    return {
      video_url: uploaded_video.url,
      message: "Successfully uploaded to MinIO S3",
    };
  }
}
