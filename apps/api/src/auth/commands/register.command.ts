import { CommandBus, CommandHandler, type ICommandHandler } from '@nestjs/cqrs';
import bcrypt from 'bcryptjs';
import { CreateUserCommand } from '../../users/commands/create-user.command.js';
import type { PublicUser } from '../../users/users.types.js';
import { type AuthResult, TokenService } from '../token.service.js';

export class RegisterCommand {
  constructor(
    public readonly email: string,
    public readonly name: string | undefined,
    public readonly password: string,
  ) {}
}

@CommandHandler(RegisterCommand)
export class RegisterHandler implements ICommandHandler<RegisterCommand, AuthResult> {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly tokens: TokenService,
  ) {}

  async execute({ email, name, password }: RegisterCommand): Promise<AuthResult> {
    const passwordHash = await bcrypt.hash(password, 12);
    const user: PublicUser = await this.commandBus.execute(
      new CreateUserCommand(email, name, passwordHash),
    );
    return this.tokens.issue(user);
  }
}
