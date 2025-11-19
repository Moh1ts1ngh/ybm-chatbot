import express from "express";
import { ingestFile } from "../controllers/filesController";
import { tenantContext } from "../middlewares/tenantContext";

const router = express.Router();

router.post("/:fileId/ingest", tenantContext(), ingestFile);

export default router;

