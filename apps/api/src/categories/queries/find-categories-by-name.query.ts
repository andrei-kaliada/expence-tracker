import { type IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import type { Category } from '@prisma/client';
import { CategoriesRepository } from '../categories.repository.js';

export class FindCategoriesByNameQuery {
  constructor(
    public readonly userId: string,
    public readonly name: string,
  ) {}
}

@QueryHandler(FindCategoriesByNameQuery)
export class FindCategoriesByNameHandler
  implements IQueryHandler<FindCategoriesByNameQuery, Category[]>
{
  constructor(private readonly categories: CategoriesRepository) {}

  execute({ userId, name }: FindCategoriesByNameQuery) {
    return this.categories.searchByName(userId, name);
  }
}
