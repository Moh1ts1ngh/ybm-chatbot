import express from "express";
import { getUsage } from "../controllers/adminController";
import { tenantContext } from "../middlewares/tenantContext";

const router = express.Router();

router.get("/usage", tenantContext(), getUsage);

export default router;
