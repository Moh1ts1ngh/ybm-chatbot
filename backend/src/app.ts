import express from "express";
import cors from "cors";
import routes from "./routes";
import { errorHandler } from "./middlewares/errorHandler";
// import routes from "./routes/index";

const app = express();
app.use(cors());

// Use express built-in parsers instead of body-parser
// These work better with multer for file uploads
app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: true, limit: "5mb" }));

app.use("/api/v1", routes);

app.get("/api/v1", (req, res) =>
  res.send({ status: "ok", service: "rag-chatbot" })
);

// Error handler should be last
app.use(errorHandler);

export default app;
