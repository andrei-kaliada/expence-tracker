import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { AuthGuardsModule } from '../auth/auth-guards.module.js';
import { CreateUserHandler } from './commands/create-user.command.js';
import { RecordLoginHandler } from './commands/record-login.command.js';
import { GetUserByEmailHandler } from './queries/get-user-by-email.query.js';
import { GetUserByIdHandler } from './queries/get-user-by-id.query.js';
import { UsersController } from './users.controller.js';
import { UsersRepository } from './users.repository.js';

@Module({
  imports: [CqrsModule, AuthGuardsModule],
  controllers: [UsersController],
  providers: [
    UsersRepository,
    CreateUserHandler,
    RecordLoginHandler,
    GetUserByEmailHandler,
    GetUserByIdHandler,
  ],
  exports: [UsersRepository],
})
export class UsersModule {}
