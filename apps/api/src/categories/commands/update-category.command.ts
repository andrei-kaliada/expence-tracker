import { NotFoundException } from '@nestjs/common';
import { CommandHandler, type ICommandHandler } from '@nestjs/cqrs';
import type { Category } from '@prisma/client';
import { CategoriesRepository } from '../categories.repository.js';

export class UpdateCategoryCommand {
  constructor(
    public readonly userId: string,
    public readonly id: string,
    public readonly name?: string,
    public readonly color?: string,
  ) {}
}

@CommandHandler(UpdateCategoryCommand)
export class UpdateCategoryHandler implements ICommandHandler<UpdateCategoryCommand, Category> {
  constructor(private readonly categories: CategoriesRepository) {}

  async execute({ userId, id, name, color }: UpdateCategoryCommand) {
    if (!(await this.categories.findOwned(id, userId))) {
      throw new NotFoundException('Category not found');
    }
    return this.categories.update(id, { name, color });
  }
}
