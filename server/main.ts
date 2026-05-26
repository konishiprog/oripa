import express, { Request, Response } from "express";
import { runtime } from "./runtime/index";

let app = express();

async function initializeServer() {
  try {
    await runtime.init();
    app = runtime.app;
    await runtime.start();
  } catch (err: any) {
    console.error("Failed to initialize server:", err);
    const cors = require("cors");
    const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(",") || [
      "http://localhost:4200",
    ];
    app.use(
      cors({
        origin: (origin: any, callback: any) => {
          if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
          } else {
            callback(new Error("Not allowed by CORS"));
          }
        },
        credentials: true,
      }),
    );
    app.get("/health", (req: Request, res: Response) => {
      res.json({ status: "error", error: err.message });
    });
    const PORT = parseInt(process.env.PORT || "3000", 10);
    app.listen(PORT, "0.0.0.0", () => {});
  }
}

initializeServer();

export default app;
