import { Injectable, NotFoundException } from '@nestjs/common';
import { UpdateMinutesDto } from './dto/update-minutes.dto';
import { PrismaService } from 'src/prisma.service';
import { ApiResponse } from 'interfaces/api-response.interface';

@Injectable()
export class UsersService {
    constructor(private prisma: PrismaService) {}

    async update(id: number, updateMinutesDto: UpdateMinutesDto): Promise<UpdateMinutesDto> {
        const { minutes } = updateMinutesDto;
        const user = await this.prisma.user.findUnique({
            where: {
                id
            }
        })

        if (!user) {
            throw new NotFoundException({
                response: { status: 404, errors: { event: 'User not found' } },
                status: 404,
                message: 'User not found',
                name: 'NotFoundException',
            });
        }

        const updatedUser = await this.prisma.user.update({
            where: { id },
            data: {
                minutes,
            },
        });

        return updatedUser;
    }

    async getMinutesById(id: number): Promise<{minutes: number}> {
        return this.prisma.user.findUnique({where: {id}, select: {minutes: true}})
    }
}
