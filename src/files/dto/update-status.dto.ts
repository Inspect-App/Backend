import { ApiProperty } from "@nestjs/swagger";
import { Status } from "@prisma/client";
import { IsEnum, IsString } from "class-validator";

export class UpdateStatusDto {
    @ApiProperty({example: 'saved', description: 'The state of the video'})
    @IsEnum(Status)
    status: Status;
}