import express from "express";
import {
  getDocument,
  indexDocuments,
  listDocuments,
} from "../controllers/docsController";
import { tenantContext } from "../middlewares/tenantContext";

const router = express.Router();

router.use(tenantContext());
router.post("/", indexDocuments);
router.get("/", listDocuments);
router.get("/:docId", getDocument);

export default router;
