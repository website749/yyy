import express from "express";

import {
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
} from "../controllers/users.controller.js";

const router = express.Router();

router.get("/", getUsers);

router.get("/:id", getUserById);

router.patch("/:id", updateUser);

router.delete("/:id", deleteUser);

export default router;