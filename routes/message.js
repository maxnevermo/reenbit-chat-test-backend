import express from "express";
import {
  sendMessage,
  getMessages,
  updateMessage,
} from "../controllers/messageController.js";
import { ensureAuthenticated } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/:chatId", ensureAuthenticated, sendMessage);
router.get("/:chatId", ensureAuthenticated, getMessages);
router.put("/:messageId", ensureAuthenticated, updateMessage);

export default router;
