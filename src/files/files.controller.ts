import { Body, Controller, Delete, Get, Param, ParseIntPipe, Put } from '@nestjs/common';
import { FilesService } from './files.service';
import { Status } from '@prisma/client';
import { UpdateStatusDto } from './dto/update-status.dto';

@Controller('files')
export class FilesController {
    constructor(private filesService: FilesService) {}

    @Get('/:status')
    async getByStatus(@Param('status') status: Status) {
        return this.filesService.getByStatus(status);
    }

    @Put('/:id')
    async updateFileStatus(@Param('id', ParseIntPipe) id: number, @Body() statusDto: UpdateStatusDto) {
        return this.filesService.updateFileStatus(id, statusDto);
    }

    @Delete('/:id')
    async deleteFile(@Param('id', ParseIntPipe) id: number) {
        return this.filesService.deleteFile(id);
    }

    @Delete()
    async deleteAll() {
        return this.filesService.deleteAll();
    }
}
