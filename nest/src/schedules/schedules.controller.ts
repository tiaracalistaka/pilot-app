import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { SchedulesService } from './schedules.service';
import { SessionGuard } from '../common/guards/session.guard';
import { SchedulesQueryDto } from './dto/schedules.dto';

interface ApiResponse {
  success: boolean;
  data?: any;
  message?: string;
  statusCode: number;
  timestamp: string;
  requestId?: string;
}

@Controller('schedules')
@UseGuards(SessionGuard)
export class SchedulesController {
  constructor(private readonly schedulesService: SchedulesService) {}

  @Get()
  async getSchedules(
    @Query() query: SchedulesQueryDto,
  ): Promise<ApiResponse> {
    const schedules = this.schedulesService.getSchedules(query.year, query.month);

    return {
      success: true,
      data: schedules,
      message: 'Schedules retrieved successfully',
      statusCode: 200,
      timestamp: new Date().toISOString(),
    };
  }
}
