import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { FileDto } from './dto/file.dto';
import { Status } from '@prisma/client';
import { UpdateStatusDto } from './dto/update-status.dto';

@Injectable()
export class FilesService {
    constructor(private prismaService: PrismaService) {}

    async getByStatus(status: Status, id: number): Promise<FileDto[]> {
        return this.prismaService.file.findMany({where: {status: status, userId: id}});
    }

    async updateFileStatus(id: number, statusDto: UpdateStatusDto) {
        const { status } = statusDto;

        return this.prismaService.file.update(
            {
                where: { id },
                data: { status }
            }
        )
    }
    
    async deleteFile(id: number) {
        return this.prismaService.file.delete({where: {id}});
    }

    async deleteAll(id: number) {
        return this.prismaService.file.deleteMany({where: {status: Status.deleted, userId: id}})
    }
}
