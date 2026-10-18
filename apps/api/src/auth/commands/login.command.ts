import { UnauthorizedException } from '@nestjs/common';
import { CommandBus, CommandHandler, type ICommandHandler, QueryBus } from '@nestjs/cqrs';
import type { User } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { RecordLoginCommand } from '../../users/commands/record-login.command.js';
import { GetUserByEmailQuery } from '../../users/queries/get-user-by-email.query.js';
import { toPublicUser } from '../../users/users.types.js';
import { type AuthResult, TokenService } from '../token.service.js';

export class LoginCommand {
  constructor(
    public readonly email: string,
    public readonly password: string,
  ) {}
}

// Valid hash of a random string; compared against when the email is unknown so timing doesn't reveal it.
const DUMMY_HASH = '$2b$12$LRl4IQaR2kCUngMSUe0aleHPfq6s0QXANzGCSssG4YOQ35lazvfSu';

@CommandHandler(LoginCommand)
export class LoginHandler implements ICommandHandler<LoginCommand, AuthResult> {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
    private readonly tokens: TokenService,
  ) {}

  async execute({ email, password }: LoginCommand): Promise<AuthResult> {
    const user: User | null = await this.queryBus.execute(new GetUserByEmailQuery(email));
    const valid = await bcrypt.compare(password, user?.passwordHash ?? DUMMY_HASH);
    if (!user || !valid || !user.isActive) throw new UnauthorizedException('Invalid credentials');

    await this.commandBus.execute(new RecordLoginCommand(user.id));
    return this.tokens.issue(toPublicUser(user));
  }
}
