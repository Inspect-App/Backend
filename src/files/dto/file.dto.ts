import { ApiProperty } from "@nestjs/swagger";
import { Status } from "@prisma/client";

export class FileDto {
    @ApiProperty({ example: 1, description: 'The unique ID of the event' })
    id: number;

    @ApiProperty({ example: 'Video', description: 'The title of the video'})
    title: string;

    @ApiProperty({ example: 'minio:9000/inspect/video1', description: 'The url for the video on minio'})
    path: string;

    @ApiProperty({ example: 6, description: 'The duration of the video'})
    duration: number;

    @ApiProperty({ example: 'pending', description: 'The state of the video'})
    status: Status;
}