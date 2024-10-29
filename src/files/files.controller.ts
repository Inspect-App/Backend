import { Controller, Get, Param } from '@nestjs/common';
import { FilesService } from './files.service';
import { Status } from '@prisma/client';

@Controller('files')
export class FilesController {
    constructor(private filesService: FilesService) {}

    @Get('/:status')
    async getByStatus(@Param('status') status: Status) {
        return this.filesService.getByStatus(status);
    }
}
