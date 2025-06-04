import express from "express";
import {
  getUserChats,
  createChat,
  deleteChat,
  updateChat,
} from "../controllers/chatController.js";
import { ensureAuthenticated } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", createChat);
router.get("/", getUserChats);
router.delete("/:id", ensureAuthenticated, deleteChat);
router.put("/:id", ensureAuthenticated, updateChat);

export default router;
