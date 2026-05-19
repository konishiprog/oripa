"use strict";

import express, { Request, Response } from "express";
import cors from "cors";
import path from "path";
import db from "../models";
import { runMigrations } from "./migration";

const admin = require("./admin");
const adminApi = require("../api/admin");
const gacha = require("./gacha");
const gachaApi = require("../api/gacha");
const card = require("./card");
const cardApi = require("../api/card");
const user = require("./user");
const userApi = require("../api/user");

let app: any;
const PORT = 3000;

/**
 * Initialize runtime with database and modules
 * @param {*} _db - Database instance
 */
async function init(_db?: any) {
  const database = _db || db;

  // Run migrations
  await runMigrations(database);

  // Initialize Express app
  app = express();
  const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:4200'];

  app.use(cors({
    origin: (origin: any, callback: any) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true
  }));
  app.use(express.json());
  app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

  // Health check endpoint
  app.get("/health", (_req: Request, res: Response) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // Test endpoint
  app.get("/api/test", (_req: Request, res: Response) => {
    res.json({ message: "Server is running!" });
  });

  // Initialize modules
  admin.init(database);
  adminApi.init({ admin });
  await gacha.init(database);
  gachaApi.init({ gacha });
  await card.init(database);
  cardApi.init({ card });
  await user.init(database);
  userApi.init({ user });

  // Register routes
  app.use("/api/admin", adminApi.app());
  app.use("/api/gacha", gachaApi.app());
  app.use("/api/card", cardApi.app());
  app.use("/api/user", userApi.app());
}

/**
 * Start the server
 * @returns {Promise<void>}
 */
function start() {
  return new Promise<void>(async (resolve, reject) => {
    await db.sequelize.sync();

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server is running on port ${PORT}`);
      resolve();
    });

    app.on("error", (err: NodeJS.ErrnoException) => {
      if (err.code === "EADDRINUSE") {
        console.error(`Port ${PORT} is already in use`);
      } else {
        console.error("Server error:", err);
      }
      reject(err);
    });
  });
}

const runtime = {
  init,
  start,
  admin,
  gacha,
  card,
  user,
  get db() {
    return db;
  },
  get app() {
    return app;
  },
};

export { runtime };
