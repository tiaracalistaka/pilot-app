import { Controller, Get, Query } from '@nestjs/common';
import { FlightHoursService } from './flight-hours.service';
import { SessionGuard } from '../common/guards/session.guard';
import { FlightHoursQueryDto, FlightHoursSummaryQueryDto } from './dto/flight-hours.dto';
import { UseGuards } from '@nestjs/common';

interface ApiResponse {
  success: boolean;
  data?: any;
  message?: string;
  statusCode: number;
  timestamp: string;
}

@Controller('flight-hours')
@UseGuards(SessionGuard)
export class FlightHoursController {
  constructor(private readonly flightHoursService: FlightHoursService) {}

  @Get()
  async getFlightHours(
    @Query() query: FlightHoursQueryDto,
  ): Promise<ApiResponse> {
    const flightHours = this.flightHoursService.getFlightHours(query.from, query.to);

    return {
      success: true,
      data: flightHours,
      message: 'Flight hours retrieved successfully',
      statusCode: 200,
      timestamp: new Date().toISOString(),
    };
  }

  @Get('summary')
  async getFlightHoursSummary(
    @Query() query: FlightHoursSummaryQueryDto,
  ): Promise<ApiResponse> {
    const summary = this.flightHoursService.getFlightHoursSummary(query.range);
    const limits = this.flightHoursService.getLimits();
    const limitSummary = this.flightHoursService.getLimitSummary();

    return {
      success: true,
      data: {
        series: summary,
        limits: limits.limits,
        chartBounds: limits.chartBounds,
        limitSummary,
      },
      message: 'Flight hours summary retrieved successfully',
      statusCode: 200,
      timestamp: new Date().toISOString(),
    };
  }
}
