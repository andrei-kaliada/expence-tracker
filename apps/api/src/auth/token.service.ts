import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { PublicUser } from '../users/users.types.js';

export interface AuthResult {
  accessToken: string;
  user: PublicUser;
}

@Injectable()
export class TokenService {
  constructor(private readonly jwt: JwtService) {}

  async issue(user: PublicUser): Promise<AuthResult> {
    const accessToken = await this.jwt.signAsync({ sub: user.id, email: user.email });
    return { accessToken, user };
  }
}
