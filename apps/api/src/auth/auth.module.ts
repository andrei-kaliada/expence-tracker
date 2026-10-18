import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { UsersModule } from '../users/users.module.js';
import { AuthController } from './auth.controller.js';
import { AuthGuardsModule } from './auth-guards.module.js';
import { LoginHandler } from './commands/login.command.js';
import { RegisterHandler } from './commands/register.command.js';
import { TokenService } from './token.service.js';

@Module({
  imports: [CqrsModule, AuthGuardsModule, UsersModule],
  controllers: [AuthController],
  providers: [TokenService, RegisterHandler, LoginHandler],
})
export class AuthModule {}
