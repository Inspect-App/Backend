import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { FileDto } from './dto/file.dto';
import { Status } from '@prisma/client';

@Injectable()
export class FilesService {
    constructor(private prismaService: PrismaService) {}

    async getByStatus(status: Status): Promise<FileDto[]> {
        return this.prismaService.file.findMany({where: {status: status}});
    }
}
