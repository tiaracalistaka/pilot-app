import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { AuthService } from '../../auth/auth.service';
import { SessionService } from '../../session/session.service';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

@Injectable()
export class SessionGuard implements CanActivate {
  private readonly cookieName = 'susi_session';

  constructor(
    private readonly authService: AuthService,
    private readonly sessionService: SessionService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest<Request>();

    const sessionInfo = this.parseSessionCookie(request);
    if (!sessionInfo) {
      throw new UnauthorizedException('Authentication required');
    }

    
    if (!this.sessionService.verifySessionToken(sessionInfo.sessionId, sessionInfo.token)) {
      throw new UnauthorizedException('Invalid session token');
    }

    
    const user = await this.authService.validateSession(sessionInfo.sessionId);
    if (!user) {
      throw new UnauthorizedException('Session expired or invalid');
    }

    
    (request as any).user = user;
    (request as any).sessionId = sessionInfo.sessionId;

    return true;
  }

  private parseSessionCookie(request: Request): { sessionId: string; token: string } | null {
    const cookies = request.cookies || {};
    const sessionCookie = cookies[this.cookieName];

    if (!sessionCookie) return null;

    const lastDotIndex = sessionCookie.lastIndexOf('.');
    if (lastDotIndex === -1) return null;

    const sessionId = sessionCookie.substring(0, lastDotIndex);
    const token = sessionCookie.substring(lastDotIndex + 1);

    if (!sessionId || !token) return null;

    return { sessionId, token };
  }
}
