import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { type AuthUser, CurrentUser } from '../auth/current-user.decorator.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { CreateCategoryCommand } from './commands/create-category.command.js';
import { DeleteCategoryCommand } from './commands/delete-category.command.js';
import { UpdateCategoryCommand } from './commands/update-category.command.js';
import { CreateCategoryDto } from './dto/create-category.dto.js';
import { SearchCategoriesDto } from './dto/search-categories.dto.js';
import { UpdateCategoryDto } from './dto/update-category.dto.js';
import { FindCategoriesByNameQuery } from './queries/find-categories-by-name.query.js';
import { ListCategoriesQuery } from './queries/list-categories.query.js';

@Controller('categories')
export class CategoriesController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  findAll(@CurrentUser() user: AuthUser) {
    return this.queryBus.execute(new ListCategoriesQuery(user.id));
  }

  @Get('search')
  @UseGuards(JwtAuthGuard)
  searchByName(@CurrentUser() user: AuthUser, @Query() query: SearchCategoriesDto) {
    return this.queryBus.execute(new FindCategoriesByNameQuery(user.id, query.name));
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@CurrentUser() user: AuthUser, @Body() dto: CreateCategoryDto) {
    return this.commandBus.execute(
      new CreateCategoryCommand(user.id, dto.name, dto.color, dto.icon),
    );
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  update(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateCategoryDto,
  ) {
    return this.commandBus.execute(
      new UpdateCategoryCommand(user.id, id, dto.name, dto.color, dto.icon),
    );
  }

  @Delete(':id')
  @HttpCode(204)
  @UseGuards(JwtAuthGuard)
  remove(@CurrentUser() user: AuthUser, @Param('id', ParseUUIDPipe) id: string) {
    return this.commandBus.execute(new DeleteCategoryCommand(user.id, id));
  }
}
