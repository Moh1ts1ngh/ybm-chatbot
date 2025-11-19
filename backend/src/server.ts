import app from "./app";
import "dotenv/config";
import { initDb } from "./db/init";

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    await initDb();
    const server = app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
    return server;
  } catch (error) {
    console.error("Error starting server:", error);
    process.exit(1);
  }
};

startServer();
