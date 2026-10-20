import { CommandHandler, type ICommandHandler } from '@nestjs/cqrs';
import type { Category } from '@prisma/client';
import { CategoriesRepository } from '../categories.repository.js';

export class CreateCategoryCommand {
  constructor(
    public readonly userId: string,
    public readonly name: string,
    public readonly color?: string,
    public readonly icon?: string,
  ) {}
}

@CommandHandler(CreateCategoryCommand)
export class CreateCategoryHandler implements ICommandHandler<CreateCategoryCommand, Category> {
  constructor(private readonly categories: CategoriesRepository) {}

  execute({ userId, name, color, icon }: CreateCategoryCommand) {
    return this.categories.create({ userId, name, color, icon });
  }
}
