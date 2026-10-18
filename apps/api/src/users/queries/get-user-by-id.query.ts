import { NotFoundException } from '@nestjs/common';
import { type IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { UsersRepository } from '../users.repository.js';
import { toPublicUser, type PublicUser } from '../users.types.js';

export class GetUserByIdQuery {
  constructor(public readonly id: string) {}
}

@QueryHandler(GetUserByIdQuery)
export class GetUserByIdHandler implements IQueryHandler<GetUserByIdQuery, PublicUser> {
  constructor(private readonly users: UsersRepository) {}

  async execute({ id }: GetUserByIdQuery): Promise<PublicUser> {
    const user = await this.users.findById(id);
    if (!user) throw new NotFoundException('User not found');
    return toPublicUser(user);
  }
}
