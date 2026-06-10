export const CONSUMPTION_TYPE = {
  COIN: "COIN",
  TICKET: "TICKET",
} as const;

export type ConsumptionTypeType =
  (typeof CONSUMPTION_TYPE)[keyof typeof CONSUMPTION_TYPE];
