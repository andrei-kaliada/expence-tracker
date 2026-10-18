import { CommandHandler, type ICommandHandler } from '@nestjs/cqrs';
import { UsersRepository } from '../users.repository.js';

export class RecordLoginCommand {
  constructor(public readonly userId: string) {}
}

@CommandHandler(RecordLoginCommand)
export class RecordLoginHandler implements ICommandHandler<RecordLoginCommand, void> {
  constructor(private readonly users: UsersRepository) {}

  async execute({ userId }: RecordLoginCommand): Promise<void> {
    await this.users.touchLastLogin(userId);
  }
}
