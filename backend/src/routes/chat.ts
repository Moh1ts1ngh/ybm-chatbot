import express from "express";
import { handleChat } from "../controllers/chatController";
import {
  getChatSession,
  listChatSessions,
} from "../controllers/chatLogsController";
import { tenantContext } from "../middlewares/tenantContext";

const router = express.Router();

router.post("/", tenantContext(false), handleChat);
router.get("/sessions", tenantContext(true), listChatSessions);
router.get("/sessions/:sessionId", tenantContext(true), getChatSession);

export default router;
