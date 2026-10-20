import { NotFoundException } from '@nestjs/common';
import { CommandHandler, type ICommandHandler } from '@nestjs/cqrs';
import { CategoriesRepository } from '../categories.repository.js';

export class DeleteCategoryCommand {
  constructor(
    public readonly userId: string,
    public readonly id: string,
  ) {}
}

@CommandHandler(DeleteCategoryCommand)
export class DeleteCategoryHandler implements ICommandHandler<DeleteCategoryCommand, void> {
  constructor(private readonly categories: CategoriesRepository) {}

  async execute({ userId, id }: DeleteCategoryCommand) {
    if (!(await this.categories.findOwned(id, userId))) {
      throw new NotFoundException('Category not found');
    }
    await this.categories.delete(id);
  }
}
