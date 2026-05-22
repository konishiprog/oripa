"use strict";

export {};

let db: any;

async function getAll() {
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
        attributes: ["name"],
        required: false,
      },
    ],
    order: [["createdAt", "DESC"]],
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
        attributes: ["name"],
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

async function init(_db: any) {
  db = _db;
}

module.exports = {
  init,
  getAll,
  getByUserId,
  create,
};
