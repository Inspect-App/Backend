import { Body, Controller, Get, Param, ParseIntPipe, Put, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateMinutesDto } from './dto/update-minutes.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth/jwt-auth.guard';

// @UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
    constructor(private userService: UsersService) {}

    @Put('minutes/:id')
    async updateMinutes(@Param('id', ParseIntPipe) id: number, @Body() updateMinutesDto: UpdateMinutesDto) {
        return this.userService.update(id, updateMinutesDto);
    }

    @Get('minutes/:id')
    async getMinnutesById(@Param('id', ParseIntPipe) id: number) {
        return this.userService.getMinutesById(id);
    }
}
