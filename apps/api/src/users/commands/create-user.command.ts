import { ConflictException } from '@nestjs/common';
import { CommandHandler, type ICommandHandler } from '@nestjs/cqrs';
import { Prisma } from '@prisma/client';
import { UsersRepository } from '../users.repository.js';
import { toPublicUser, type PublicUser } from '../users.types.js';

export class CreateUserCommand {
  constructor(
    public readonly email: string,
    public readonly name: string | undefined,
    public readonly passwordHash: string,
  ) {}
}

@CommandHandler(CreateUserCommand)
export class CreateUserHandler implements ICommandHandler<CreateUserCommand, PublicUser> {
  constructor(private readonly users: UsersRepository) {}

  async execute({ email, name, passwordHash }: CreateUserCommand): Promise<PublicUser> {
    try {
      return toPublicUser(await this.users.create({ email, name, passwordHash }));
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new ConflictException('Email is already registered');
      }
      throw error;
    }
  }
}
