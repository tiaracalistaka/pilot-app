import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';

export interface PasswordHash {
  hash: string;
  salt: string;
  algorithm: string;
  iterations: number;
}

export interface PasswordPolicy {
  minLength: number;
  requireUppercase: boolean;
  requireLowercase: boolean;
  requireNumber: boolean;
  requireSpecial: boolean;
}

@Injectable()
export class PasswordService {
  private readonly iterations = 100000;
  private readonly keyLength = 64;
  private readonly digest = 'sha512';

  private readonly policy: PasswordPolicy;

  constructor() {
    this.policy = {
      minLength: parseInt(process.env.MIN_PASSWORD_LENGTH || '8', 10),
      requireUppercase: process.env.PASSWORD_REQUIRE_UPPERCASE !== 'false',
      requireLowercase: process.env.PASSWORD_REQUIRE_LOWERCASE !== 'false',
      requireNumber: process.env.PASSWORD_REQUIRE_NUMBER !== 'false',
      requireSpecial: process.env.PASSWORD_REQUIRE_SPECIAL !== 'false',
    };
  }

  getPolicy(): PasswordPolicy {
    return { ...this.policy };
  }

  validatePassword(password: string): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (password.length < this.policy.minLength) {
      errors.push(`Password must be at least ${this.policy.minLength} characters`);
    }

    if (this.policy.requireUppercase && !/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }

    if (this.policy.requireLowercase && !/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }

    if (this.policy.requireNumber && !/[0-9]/.test(password)) {
      errors.push('Password must contain at least one number');
    }

    if (this.policy.requireSpecial && !/[!@#$%^&*(),.?":{}|<>\-_+=[\]\\|;':",./<>?]/.test(password)) {
      errors.push('Password must contain at least one special character');
    }

    return { valid: errors.length === 0, errors };
  }

  private generateSalt(): string {
    return crypto.randomBytes(32).toString('base64');
  }

  async hashPassword(password: string): Promise<PasswordHash> {
    const salt = this.generateSalt();

    return new Promise((resolve, reject) => {
      crypto.pbkdf2(password, salt, this.iterations, this.keyLength, this.digest, (err, derivedKey) => {
        if (err) reject(err);
        else {
          resolve({
            hash: derivedKey.toString('base64'),
            salt,
            algorithm: 'PBKDF2-SHA512',
            iterations: this.iterations,
          });
        }
      });
    });
  }

  async verifyPassword(password: string, hash: PasswordHash): Promise<boolean> {
    return new Promise((resolve, reject) => {
      crypto.pbkdf2(password, hash.salt, hash.iterations, this.keyLength, this.digest, (err, derivedKey) => {
        if (err) reject(err);
        else {
          
          resolve(crypto.timingSafeEqual(Buffer.from(hash.hash), derivedKey));
        }
      });
    });
  }


  generateTemporaryPassword(length: number = 16): string {
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const numbers = '0123456789';
    const special = '!@#$%^&*';
    const allChars = uppercase + lowercase + numbers + special;

    let password = '';

    password += uppercase[crypto.randomInt(uppercase.length)];
    password += lowercase[crypto.randomInt(lowercase.length)];
    password += numbers[crypto.randomInt(numbers.length)];
    password += special[crypto.randomInt(special.length)];

    for (let i = password.length; i < length; i++) {
      password += allChars[crypto.randomInt(allChars.length)];
    }

    return password.split('').sort(() => crypto.randomInt(3) - 1).join('');
  }

  quickHash(data: string): string {
    return crypto.createHash('sha256').update(data).digest('hex');
  }
}
