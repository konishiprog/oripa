/**
 * 'api/coin-exchange-rate': Project API for Coin Exchange Rate Management
 */
export {};

import express, { Request, Response, Router } from "express";

let runtime: any;

const validateCoinExchangeRatePayload = (
  req: Request,
  res: Response,
): boolean => {
  const { coin, price, ticket } = req.body;

  if (
    coin === undefined ||
    coin === null ||
    price === undefined ||
    price === null
  ) {
    res.status(400).json({ error: "Coin and price are required" });
    return false;
  }

  if (!Number.isInteger(coin) || coin <= 0) {
    res.status(400).json({ error: "Coin must be a positive integer" });
    return false;
  }

  if (!Number.isInteger(price) || price <= 0) {
    res.status(400).json({ error: "Price must be a positive integer" });
    return false;
  }

  if (
    ticket !== undefined &&
    (!Number.isInteger(ticket) || ticket < 0)
  ) {
    res
      .status(400)
      .json({ error: "Ticket must be a non-negative integer" });
    return false;
  }

  return true;
};

module.exports = {
  init: function (_runtime: any) {
    runtime = _runtime;
  },

  app: function () {
    const router: Router = express.Router();

    router.get("/", async (_req: Request, res: Response) => {
      try {
        const rates = await runtime.coinExchangeRate.getAll();
        res.status(200).json({ message: "Success", data: rates });
      } catch (error: any) {
        console.error("Failed to fetch coin exchange rates:", error);
        res.status(500).json({ error: "Failed to fetch coin exchange rates" });
      }
    });

    router.post("/", async (req: Request, res: Response) => {
      if (!validateCoinExchangeRatePayload(req, res)) return;

      try {
        const { coin, price, ticket } = req.body;
        const rate = await runtime.coinExchangeRate.create(
          coin,
          price,
          ticket,
        );
        res.status(201).json({ message: "Exchange rate created", data: rate });
      } catch (error: any) {
        console.error("Failed to create coin exchange rate:", error);
        if (error.message.includes("already exists")) {
          return res.status(400).json({ error: error.message });
        }
        res.status(500).json({ error: "Failed to create coin exchange rate" });
      }
    });

    router.put("/:id", async (req: Request, res: Response) => {
      if (!validateCoinExchangeRatePayload(req, res)) return;

      try {
        const { id } = req.params;
        const { coin, price, ticket } = req.body;
        const rate = await runtime.coinExchangeRate.update(
          id,
          coin,
          price,
          ticket,
        );
        res.status(200).json({ message: "Exchange rate updated", data: rate });
      } catch (error: any) {
        console.error("Failed to update coin exchange rate:", error);
        if (error.message.includes("not found")) {
          return res.status(404).json({ error: error.message });
        }
        if (error.message.includes("already exists")) {
          return res.status(400).json({ error: error.message });
        }
        res.status(500).json({ error: "Failed to update coin exchange rate" });
      }
    });

    router.delete("/:id", async (req: Request, res: Response) => {
      try {
        const { id } = req.params;
        await runtime.coinExchangeRate.deleteRate(id);
        res.status(200).json({ message: "Exchange rate deleted" });
      } catch (error: any) {
        console.error("Failed to delete coin exchange rate:", error);
        if (error.message.includes("not found")) {
          return res.status(404).json({ error: error.message });
        }
        res.status(500).json({ error: "Failed to delete coin exchange rate" });
      }
    });

    return router;
  },
};
