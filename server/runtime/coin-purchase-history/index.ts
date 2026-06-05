"use strict";

export {};

import { v4 as uuidv4 } from "uuid";
import {
  createPaymentIntent,
  retrievePaymentIntent,
} from "../../utils/stripeService";

let db: any;
let runtime: any;

async function getAll(limit: number = 100, offset: number = 0) {
  const histories = await db.CoinPurchaseHistory.findAll({
    attributes: [
      "id",
      "userId",
      "price",
      "point",
      "specialPoint",
      "status",
      "createdAt",
    ],
    include: [
      {
        model: db.User,
        attributes: ["name", "nickname"],
        required: false,
      },
    ],
    order: [["createdAt", "DESC"]],
    limit,
    offset,
    raw: true,
  });
  return histories || [];
}

async function getByUserId(userId: string) {
  const histories = await db.CoinPurchaseHistory.findAll({
    where: { userId },
    attributes: [
      "id",
      "userId",
      "price",
      "point",
      "specialPoint",
      "status",
      "createdAt",
    ],
    include: [
      {
        model: db.User,
        attributes: ["name", "nickname"],
        required: false,
      },
    ],
    order: [["createdAt", "DESC"]],
    raw: true,
  });
  return histories || [];
}

async function create(
  userId: string,
  price: number,
  point: number,
  specialPoint: number = 0,
) {
  const history = await db.CoinPurchaseHistory.create({
    userId,
    price,
    point,
    specialPoint,
    status: "completed",
  });
  return history.get({ plain: true });
}

async function createCharge(
  userId: string,
  amount: number,
  point: number,
  specialPoint: number = 0,
) {
  const paymentIntent = await createPaymentIntent({
    userId,
    amount,
    point,
    specialPoint,
    currency: "JPY",
  });

  const history = await db.CoinPurchaseHistory.create({
    id: uuidv4(),
    userId,
    price: amount,
    point,
    specialPoint,
    status: "pending",
    stripePaymentIntentId: paymentIntent.id,
  });

  return {
    clientSecret: paymentIntent.client_secret,
    chargeHistoryId: history.id,
  };
}

async function getChargeHistory(userId: string, limit: number = 50, offset: number = 0) {
  const histories = await db.CoinPurchaseHistory.findAll({
    where: { userId },
    attributes: [
      "id",
      "userId",
      "price",
      "point",
      "specialPoint",
      "status",
      "paymentMethod",
      "stripePaymentIntentId",
      "failureReason",
      "createdAt",
    ],
    order: [["createdAt", "DESC"]],
    limit,
    offset,
    raw: true,
  });
  return histories || [];
}

async function updateChargeStatus(
  paymentIntentId: string,
  status: string,
  paymentMethod?: string,
  failureReason?: string,
) {
  const history = await db.CoinPurchaseHistory.findOne({
    where: { stripePaymentIntentId: paymentIntentId },
  });

  if (!history) {
    throw new Error("Charge history not found");
  }

  await history.update({
    status,
    paymentMethod,
    failureReason,
  });

  if (status === "succeeded") {
    const user = await db.User.findByPk(history.userId);
    if (user) {
      const currentCoin = user.coin || 0;
      const specialPoint = user.specialPoint || 0;
      await user.update({
        coin: currentCoin + history.point,
        specialPoint: specialPoint + history.specialPoint,
      });
      if (runtime && runtime.user) {
        await runtime.user.refreshCache();
      }
    }
  }

  return history.get({ plain: true });
}

async function getByPaymentIntentId(paymentIntentId: string) {
  const history = await db.CoinPurchaseHistory.findOne({
    where: { stripePaymentIntentId: paymentIntentId },
  });
  return history?.get({ plain: true }) || null;
}

async function init(_db: any, _runtime?: any) {
  db = _db;
  runtime = _runtime;
}

module.exports = {
  init,
  getAll,
  getByUserId,
  create,
  createCharge,
  getChargeHistory,
  updateChargeStatus,
  getByPaymentIntentId,
};
