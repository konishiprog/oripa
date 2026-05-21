export const CARD_STATUS = {
  NOT_DRAWN: "未引き",
  DRAWN: "引かれた",
  REFUNDED: "差し戻し",
  SHIPPING_PENDING: "発送待ち",
  SHIPPED: "発送済み",
} as const;

export type CardStatusType = (typeof CARD_STATUS)[keyof typeof CARD_STATUS];

export const EXCHANGE_TYPE = {
  SHIPPING_ONLY: "SHIPPING_ONLY",
  BOTH: "BOTH",
} as const;

export type ExchangeTypeType =
  (typeof EXCHANGE_TYPE)[keyof typeof EXCHANGE_TYPE];
