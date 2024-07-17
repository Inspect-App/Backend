export type AppMimeType = "video/mp4" | "video/avi" | "video/mov";

export interface BufferedFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: AppMimeType;
  size: number;
  buffer: Buffer | string;
}

export interface StoredFile extends HasFile, StoredFileMetadata {}

export interface HasFile {
  file: Buffer | string;
}

export interface StoredFileMetadata {
  id: string;
  name: string;
  encoding: string;
  mimetype: AppMimeType;
  size: number;
  updatedAt: Date;
  fileSrc?: string;
}

export interface VideoFileMetadata extends StoredFileMetadata {
  duration?: number;
  resolution?: string;
}

export interface BufferedVideoFile extends BufferedFile {
  mimetype: AppMimeType;
}

export interface StoredVideoFile extends HasFile, VideoFileMetadata {}
