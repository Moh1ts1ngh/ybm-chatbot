import express from "express";
import healthRouter from "./health";
import chatRouter from "./chat";
import docsRouter from "./docs";
import tenantsRouter from "./tenants";
import filesRouter from "./files";
import embedRouter from "./embed";
import adminRouter from "./admin";

const router = express.Router();

router.use("/health", healthRouter);
router.use("/chat", chatRouter);
router.use("/docs", docsRouter);
router.use("/tenants", tenantsRouter);
router.use("/files", filesRouter);
router.use("/embed", embedRouter);
router.use("/admin", adminRouter);
export default router;
