import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { SessionService, Session } from '../session/session.service';
import { SecurityService } from '../security/security.service';
import { PasswordService } from '../security/password.service';
import { loginSchema, SessionUser, ApiResponse } from '../security/schemas';
import { DataLoaderService, PilotAccount } from '../common/services/data-loader.service';

@Injectable()
export class AuthService {
  private readonly sessionMaxAge: number;

  constructor(
    private readonly sessionService: SessionService,
    private readonly securityService: SecurityService,
    private readonly passwordService: PasswordService,
    private readonly dataLoader: DataLoaderService,
  ) {
    this.sessionMaxAge = parseInt(process.env.SESSION_MAX_AGE || '86400000', 10); // 24 hours
  }

  async validateCredentials(username: string, password: string): Promise<PilotAccount | null> {
    const pilot = this.dataLoader.getPilotByUsername(username);
    if (!pilot) return null;

    if (pilot.password === password) {
      return pilot;
    }

    return null;
  }

  async login(
    username: string,
    password: string,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<{
    sessionId: string;
    sessionToken: string;
    user: SessionUser;
    expiresAt: number;
  }> {
    
    const validation = loginSchema.safeParse({ username, password });
    if (!validation.success) {
      const errors = validation.error.errors.map(e => e.message).join(', ');
      throw new BadRequestException(this.sanitizeErrorMessage(errors));
    }

    
    if (this.securityService.isLocked(username)) {
      const remaining = this.securityService.getLockoutRemaining(username);
      throw new UnauthorizedException(
        `Account temporarily locked. Try again in ${Math.ceil(remaining / 60)} minutes.`,
      );
    }

    
    const pilot = await this.validateCredentials(username, password);
    if (!pilot) {
      
      const attemptInfo = this.securityService.recordFailedAttempt(username);
      const remaining = this.securityService.getRemainingAttempts(username);

      if (this.securityService.isLocked(username)) {
        throw new UnauthorizedException(
          'Too many failed attempts. Account temporarily locked for 15 minutes.',
        );
      }

      throw new UnauthorizedException(
        `Invalid credentials. ${remaining} attempt(s) remaining.`,
      );
    }

    
    this.securityService.resetAttempts(username);

    
    const { session, token: sessionToken } = this.sessionService.createSession(
      pilot.id,
      {
        username: pilot.username,
        name: pilot.name,
        avatar: pilot.avatar,
        role: pilot.role,
      },
      this.sessionMaxAge,
      ipAddress,
      userAgent,
    );

    return {
      sessionId: session.id,
      sessionToken,
      user: {
        id: pilot.id,
        username: pilot.username,
        name: pilot.name,
        avatar: pilot.avatar,
        loginAt: session.createdAt,
        lastActivity: session.lastActivity,
      },
      expiresAt: session.expiresAt,
    };
  }

  async logout(sessionId: string): Promise<void> {
    this.sessionService.destroySession(sessionId);
  }

  async validateSession(sessionId: string): Promise<SessionUser | null> {
    const session = this.sessionService.getSession(sessionId);
    if (!session) return null;

    
    this.sessionService.updateSession(sessionId);

    return {
      id: session.userId,
      username: session.data['username'] as string,
      name: session.data['name'] as string,
      avatar: session.data['avatar'] as string,
      loginAt: session.createdAt,
      lastActivity: session.lastActivity,
    };
  }


  async getSessionInfo(sessionId: string): Promise<Session | null> {
    return this.sessionService.getSession(sessionId);
  }

 
  private sanitizeErrorMessage(message: string): string {
    
    return 'Invalid input provided';
  }

 
  getPilotProfile(userId: string): Omit<PilotAccount, 'password'> | null {
    return this.dataLoader.getPilotById(userId);
  }
}
