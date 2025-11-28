import type { Request, Response, NextFunction } from "express";
import { UserRepository } from "../repositories/user.repository";

const userRepository = new UserRepository();

export class UserController {
  async createUser(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, name } = req.body;

      if (!email) {
        return res.status(400).json({ error: "Email is required" });
      }

      const user = await userRepository.create({
        email,
        name,
      });

      res.status(201).json(user);
    } catch (error) {
      next(error);
    }
  }

  async getUser(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      const user = await userRepository.findUnique({
        id: parseInt(id, 10),
      });

      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      res.json(user);
    } catch (error) {
      next(error);
    }
  }

  async getUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const users = await userRepository.findMany();
      res.json(users);
    } catch (error) {
      next(error);
    }
  }

  async updateUser(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { email, name } = req.body;

      const user = await userRepository.update(
        { id: parseInt(id, 10) },
        { email, name }
      );

      res.json(user);
    } catch (error) {
      next(error);
    }
  }

  async deleteUser(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      await userRepository.delete({
        id: parseInt(id, 10),
      });

      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}
