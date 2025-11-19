import express from "express";
import {
  createEmbed,
  deleteEmbed,
  issueEmbedToken,
  listEmbeds,
} from "../controllers/embedController";
import { tenantContext } from "../middlewares/tenantContext";

const router = express.Router();

router.use(tenantContext());
router.get("/", listEmbeds);
router.post("/", createEmbed);
router.post("/token", issueEmbedToken);
router.delete("/:embedId", deleteEmbed);

export default router;

