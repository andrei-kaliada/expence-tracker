import { type IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import type { User } from '@prisma/client';
import { UsersRepository } from '../users.repository.js';

/** Internal use only: returns the full record including `passwordHash`. */
export class GetUserByEmailQuery {
  constructor(public readonly email: string) {}
}

@QueryHandler(GetUserByEmailQuery)
export class GetUserByEmailHandler implements IQueryHandler<GetUserByEmailQuery, User | null> {
  constructor(private readonly users: UsersRepository) {}

  execute({ email }: GetUserByEmailQuery) {
    return this.users.findByEmail(email);
  }
}
