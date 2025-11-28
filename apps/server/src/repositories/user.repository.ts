import { prisma } from "../lib/prisma";
import type { User, Prisma } from "@prisma/client";

export class UserRepository {
  async create(data: Prisma.UserCreateInput): Promise<User> {
    return prisma.user.create({ data });
  }

  async findUnique(where: Prisma.UserWhereUniqueInput): Promise<User | null> {
    return prisma.user.findUnique({ where });
  }

  async findMany(args?: Prisma.UserFindManyArgs): Promise<User[]> {
    return prisma.user.findMany(args);
  }

  async update(
    where: Prisma.UserWhereUniqueInput,
    data: Prisma.UserUpdateInput
  ): Promise<User> {
    return prisma.user.update({ where, data });
  }

  async delete(where: Prisma.UserWhereUniqueInput): Promise<User> {
    return prisma.user.delete({ where });
  }
}
