import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { LoginAttempt } from './schemas';

@Injectable()
export class SecurityService implements OnModuleDestroy {
  private loginAttempts: Map<string, LoginAttempt> = new Map();
  private readonly cleanupInterval = 300000; // 5 minutes
  private cleanupTimer: NodeJS.Timeout;

  private readonly maxAttempts: number;
  private readonly lockoutDuration: number; // in seconds

  constructor() {
    this.maxAttempts = parseInt(process.env.MAX_LOGIN_ATTEMPTS || '5', 10);
    this.lockoutDuration = parseInt(process.env.LOGIN_LOCKOUT_DURATION || '900', 10);
    this.cleanupTimer = setInterval(() => this.cleanup(), this.cleanupInterval);
  }

  onModuleDestroy() {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
    }
  }

  recordFailedAttempt(identifier: string): { attempts: number; lockedUntil: number | null } {
    const now = Date.now();
    const attempt = this.loginAttempts.get(identifier) || {
      count: 0,
      lastAttempt: 0,
      lockedUntil: null,
    };

    if (attempt.lockedUntil && now > attempt.lockedUntil) {
      attempt.count = 0;
      attempt.lockedUntil = null;
    }

    attempt.count++;
    attempt.lastAttempt = now;

    if (attempt.count >= this.maxAttempts) {
      attempt.lockedUntil = now + this.lockoutDuration * 1000;
    }

    this.loginAttempts.set(identifier, attempt);
    return { attempts: attempt.count, lockedUntil: attempt.lockedUntil };
  }

  isLocked(identifier: string): boolean {
    const attempt = this.loginAttempts.get(identifier);
    if (!attempt) return false;

    const now = Date.now();
    return attempt.lockedUntil !== null && now < attempt.lockedUntil;
  }

  getRemainingAttempts(identifier: string): number {
    const attempt = this.loginAttempts.get(identifier);
    if (!attempt) return this.maxAttempts;

    if (this.isLocked(identifier)) return 0;

    return Math.max(0, this.maxAttempts - attempt.count);
  }

  getLockoutRemaining(identifier: string): number {
    const attempt = this.loginAttempts.get(identifier);
    if (!attempt?.lockedUntil) return 0;

    const remaining = Math.ceil((attempt.lockedUntil - Date.now()) / 1000);
    return Math.max(0, remaining);
  }

  resetAttempts(identifier: string): void {
    this.loginAttempts.delete(identifier);
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [identifier, attempt] of this.loginAttempts.entries()) {
      
      if (now - attempt.lastAttempt > 24 * 60 * 60 * 1000) {
        this.loginAttempts.delete(identifier);
      }
    }
  }

  getAttemptInfo(identifier: string): LoginAttempt | null {
    return this.loginAttempts.get(identifier) || null;
  }
}
