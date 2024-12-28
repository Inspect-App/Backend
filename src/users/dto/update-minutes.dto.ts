import { ApiPropertyOptional } from '@nestjs/swagger';
  
export class UpdateMinutesDto {
    @ApiPropertyOptional({
      example: '8.0',
      description: "The user's minutes"
    })
    minutes: number
}
  