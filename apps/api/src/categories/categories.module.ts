import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { AuthGuardsModule } from '../auth/auth-guards.module.js';
import { CategoriesController } from './categories.controller.js';
import { CategoriesRepository } from './categories.repository.js';
import { CreateCategoryHandler } from './commands/create-category.command.js';
import { DeleteCategoryHandler } from './commands/delete-category.command.js';
import { UpdateCategoryHandler } from './commands/update-category.command.js';
import { FindCategoriesByNameHandler } from './queries/find-categories-by-name.query.js';
import { ListCategoriesHandler } from './queries/list-categories.query.js';

@Module({
  imports: [CqrsModule, AuthGuardsModule],
  controllers: [CategoriesController],
  providers: [
    CategoriesRepository,
    CreateCategoryHandler,
    UpdateCategoryHandler,
    DeleteCategoryHandler,
    ListCategoriesHandler,
    FindCategoriesByNameHandler,
  ],
})
export class CategoriesModule {}
