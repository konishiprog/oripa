"use strict";

import express, { Request, Response } from "express";
import cors from "cors";
import path from "path";
import db from "../models";
import { runMigrations } from "./migration";

const admin = require("./admin");
const adminApi = require("../api/admin");
const genre = require("./genre");
const genreApi = require("../api/genre");
const gacha = require("./gacha");
const gachaApi = require("../api/gacha");
const card = require("./card");
const cardApi = require("../api/card");
const user = require("./user");
const userApi = require("../api/user");
const email = require("./email");
const coinExchangeRate = require("./coin-exchange-rate");
const coinExchangeRateApi = require("../api/coin-exchange-rate");
const coinPurchaseHistory = require("./coin-purchase-history");
const coinPurchaseHistoryApi = require("../api/coin-purchase-history");
const contactApi = require("../api/contact");

let app: any;
const PORT = process.env.PORT || 3000;

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
  await genre.init(database);
  genreApi.init({ genre });
  await gacha.init(database);
  gachaApi.init({ gacha });
  await card.init(database);
  await user.init(database);
  await coinExchangeRate.init(database);
  await coinPurchaseHistory.init(database);
  cardApi.init({ card, gacha, user, email, admin });
  userApi.init({ user, email, coinExchangeRate, coinPurchaseHistory, card });
  coinExchangeRateApi.init({ coinExchangeRate });
  coinPurchaseHistoryApi.init({ coinPurchaseHistory });
  contactApi.init({ user, admin, email });

  // Register routes
  app.use("/api/admin", adminApi.app());
  app.use("/api/genre", genreApi.app());
  app.use("/api/gacha", gachaApi.app());
  app.use("/api/card", cardApi.app());
  app.use("/api/user", userApi.app());
  app.use("/api/coin-exchange-rate", coinExchangeRateApi.app());
  app.use("/api/coin-purchase-history", coinPurchaseHistoryApi.app());
  app.use("/api/contact", contactApi.app());
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
  genre,
  gacha,
  card,
  user,
  email,
  coinExchangeRate,
  get db() {
    return db;
  },
  get app() {
    return app;
  },
};

export { runtime };
