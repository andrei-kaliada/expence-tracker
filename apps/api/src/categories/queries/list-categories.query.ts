import { type IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import type { Category } from '@prisma/client';
import { CategoriesRepository } from '../categories.repository.js';

export class ListCategoriesQuery {
  constructor(public readonly userId: string) {}
}

@QueryHandler(ListCategoriesQuery)
export class ListCategoriesHandler implements IQueryHandler<ListCategoriesQuery, Category[]> {
  constructor(private readonly categories: CategoriesRepository) {}

  execute({ userId }: ListCategoriesQuery) {
    return this.categories.findAllByUser(userId);
  }
}
