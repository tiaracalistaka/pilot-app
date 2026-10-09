import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { randomBytes, createHmac } from 'crypto';

export interface Session {
  id: string;
  userId: string;
  data: Record<string, unknown>;
  createdAt: number;
  expiresAt: number;
  lastActivity: number;
  ipAddress?: string;
  userAgent?: string;
}

@Injectable()
export class SessionService implements OnModuleDestroy {
  private sessions: Map<string, Session> = new Map();
  private sessionTokens: Map<string, string> = new Map();
  private readonly sessionPrefix = 'sess:';
  private readonly cleanupInterval = 60000; 
  private cleanupTimer: NodeJS.Timeout;

  constructor() {
    this.cleanupTimer = setInterval(() => this.cleanup(), this.cleanupInterval);
  }

  onModuleDestroy() {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
    }
  }

  generateSessionId(): string {
    const timestamp = Date.now().toString(36);
    const random = randomBytes(32).toString('base64url');
    return `${timestamp}.${random}`;
  }

  createSession(
    userId: string,
    data: Record<string, unknown> = {},
    maxAge: number = 24 * 60 * 60 * 1000, // 24 hours
    ipAddress?: string,
    userAgent?: string,
  ): { session: Session; token: string } {
    const sessionId = this.generateSessionId();
    const now = Date.now();
    const token = this.generateSessionToken(sessionId);

    const session: Session = {
      id: sessionId,
      userId,
      data,
      createdAt: now,
      expiresAt: now + maxAge,
      lastActivity: now,
      ipAddress,
      userAgent,
    };

    this.sessions.set(sessionId, session);
    this.sessionTokens.set(sessionId, token);
    return { session, token };
  }

  getSession(sessionId: string): Session | null {
    const session = this.sessions.get(sessionId);
    if (!session) return null;

    if (Date.now() > session.expiresAt) {
      this.destroySession(sessionId);
      return null;
    }

    return session;
  }

  updateSession(sessionId: string, data: Partial<Record<string, unknown>> = {}): Session | null {
    const session = this.getSession(sessionId);
    if (!session) return null;

    session.lastActivity = Date.now();
    session.data = { ...session.data, ...data };

    return session;
  }

  destroySession(sessionId: string): boolean {
    this.sessionTokens.delete(sessionId);
    return this.sessions.delete(sessionId);
  }

  destroyAllUserSessions(userId: string): number {
    let count = 0;
    for (const [sessionId, session] of this.sessions.entries()) {
      if (session.userId === userId) {
        this.sessions.delete(sessionId);
        count++;
      }
    }
    return count;
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [sessionId, session] of this.sessions.entries()) {
      if (now > session.expiresAt) {
        this.sessionTokens.delete(sessionId);
        this.sessions.delete(sessionId);
      }
    }
  }

  getSessionCount(): number {
    return this.sessions.size;
  }

  generateSessionToken(sessionId: string): string {
    const payload = `${sessionId}.${Date.now()}`;
    return createHmac('sha256', process.env.SESSION_SECRET || 'default-secret')
      .update(payload)
      .digest('base64url');
  }

  verifySessionToken(sessionId: string, token: string): boolean {
    const storedToken = this.sessionTokens.get(sessionId);
    if (!storedToken) return false;
    return token === storedToken;
  }
}
