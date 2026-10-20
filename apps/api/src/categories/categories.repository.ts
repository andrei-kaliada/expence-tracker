import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class CategoriesRepository {
  constructor(private readonly prisma: PrismaService) {}

  findAllByUser(userId: string) {
    return this.prisma.category.findMany({ where: { userId }, orderBy: { name: 'asc' } });
  }

  searchByName(userId: string, name: string) {
    return this.prisma.category.findMany({
      where: { userId, name: { contains: name, mode: 'insensitive' } },
      orderBy: { name: 'asc' },
    });
  }

  findOwned(id: string, userId: string) {
    return this.prisma.category.findFirst({ where: { id, userId } });
  }

  create(data: { userId: string; name: string; color?: string; icon?: string }) {
    return this.prisma.category.create({ data });
  }

  update(id: string, data: { name?: string; color?: string; icon?: string }) {
    return this.prisma.category.update({ where: { id }, data });
  }

  delete(id: string) {
    return this.prisma.category.delete({ where: { id } });
  }
}
