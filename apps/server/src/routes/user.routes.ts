import express from "express";
import { UserController } from "../controllers/user.controller";

const router = express.Router();
const userController = new UserController();

router.post("/", (req, res, next) => userController.createUser(req, res, next));
router.get("/", (req, res, next) => userController.getUsers(req, res, next));
router.get("/:id", (req, res, next) => userController.getUser(req, res, next));
router.patch("/:id", (req, res, next) =>
  userController.updateUser(req, res, next)
);
router.delete("/:id", (req, res, next) =>
  userController.deleteUser(req, res, next)
);

export default router;
