import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { PilotService } from './pilot.service';
import { SessionGuard } from '../common/guards/session.guard';

interface ApiResponse {
  success: boolean;
  data?: any;
  message?: string;
  statusCode: number;
  timestamp: string;
  requestId?: string;
}

@Controller('pilot')
@UseGuards(SessionGuard)
export class PilotController {
  constructor(
    private readonly pilotService: PilotService,
  ) {}

  @Get('me')
  async getProfile(@Req() req: Request): Promise<ApiResponse> {
    const user = (req as Request & { user?: { id: string } }).user;
    const profile = user ? this.pilotService.getProfileById(user.id) : null;

    return {
      success: true,
      data: profile,
      message: 'Profile retrieved successfully',
      statusCode: 200,
      timestamp: new Date().toISOString(),
    };
  }
}
