import express from "express";
import {
  createTenantHandler,
  createUploadUrl,
  getTenantHandler,
  resolveTenantForEmail,
} from "../controllers/tenantController";
import { tenantContext } from "../middlewares/tenantContext";

const router = express.Router();

router.post("/", createTenantHandler);
router.get("/", tenantContext(true), getTenantHandler);
router.post("/resolve", resolveTenantForEmail);
router.post("/:tenantId/upload-url", tenantContext(false), createUploadUrl);

export default router;
