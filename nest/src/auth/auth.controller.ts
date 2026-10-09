import {
  Controller,
  Post,
  Get,
  Body,
  Req,
  Res,
  HttpCode,
  HttpStatus,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { SessionService } from '../session/session.service';
import { Public } from '../common/decorators/public.decorator';
import { ApiResponse } from '../security/schemas';
import { LoginDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {
  private readonly cookieName = 'susi_session';
  private readonly cookieSecure = process.env.NODE_ENV === 'production';
  private readonly cookieSameSite: 'lax' | 'strict' | 'none' = 'lax';

  constructor(
    private readonly authService: AuthService,
    private readonly sessionService: SessionService,
  ) {}

  @Post('login')
  @Public()
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() body: LoginDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<ApiResponse> {
    const ipAddress = this.getClientIP(req);
    const userAgent = req.headers['user-agent'];

    const result = await this.authService.login(body.username, body.password, ipAddress, userAgent);

    res.cookie(this.cookieName, `${result.sessionId}.${result.sessionToken}`, {
      httpOnly: true,
      secure: this.cookieSecure,
      sameSite: this.cookieSameSite,
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      path: '/',
    });

    return {
      success: true,
      data: {
        token: result.sessionToken,
        user: result.user,
        expiresAt: result.expiresAt,
      },
      message: 'Login successful',
      statusCode: 200,
      timestamp: new Date().toISOString(),
      requestId: this.generateRequestId(),
    };
  }

  @Post('logout')
  @Public()
  @HttpCode(HttpStatus.OK)
  async logout(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<ApiResponse> {
    const sessionInfo = this.parseSessionCookie(req);

    if (sessionInfo) {
      await this.authService.logout(sessionInfo.sessionId);
    }

    res.clearCookie(this.cookieName, {
      httpOnly: true,
      secure: this.cookieSecure,
      sameSite: this.cookieSameSite,
      path: '/',
    });

    return {
      success: true,
      message: 'Logout successful',
      statusCode: 200,
      timestamp: new Date().toISOString(),
      requestId: this.generateRequestId(),
    };
  }

  @Get('session')
  @Public()
  async getSession(@Req() req: Request): Promise<ApiResponse> {
    const sessionInfo = this.parseSessionCookie(req);

    if (!sessionInfo) {
      throw new UnauthorizedException('No active session');
    }

    if (!this.sessionService.verifySessionToken(sessionInfo.sessionId, sessionInfo.token)) {
      throw new UnauthorizedException('Invalid session token');
    }

    const user = await this.authService.validateSession(sessionInfo.sessionId);

    if (!user) {
      throw new UnauthorizedException('Session expired or invalid');
    }

    return {
      success: true,
      data: { user },
      statusCode: 200,
      timestamp: new Date().toISOString(),
      requestId: this.generateRequestId(),
    };
  }

  private parseSessionCookie(req: Request): { sessionId: string; token: string } | null {
    const cookies = req.cookies || {};
    const sessionCookie = cookies[this.cookieName];

    if (!sessionCookie) return null;

    const lastDotIndex = sessionCookie.lastIndexOf('.');
    if (lastDotIndex === -1) return null;

    const sessionId = sessionCookie.substring(0, lastDotIndex);
    const token = sessionCookie.substring(lastDotIndex + 1);

    if (!sessionId || !token) return null;

    return {
      sessionId,
      token,
    };
  }

  private getClientIP(req: Request): string {
    const forwarded = req.headers['x-forwarded-for'];
    if (typeof forwarded === 'string') {
      return forwarded.split(',')[0].trim();
    }
    return req.ip || req.socket.remoteAddress || 'unknown';
  }

  private generateRequestId(): string {
    return `req_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 9)}`;
  }
}
