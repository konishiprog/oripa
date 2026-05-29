export const CONSUMPTION_TYPE = {
  COIN: "COIN",
  SPECIAL_POINT: "SPECIAL_POINT",
} as const;

export type ConsumptionTypeType =
  (typeof CONSUMPTION_TYPE)[keyof typeof CONSUMPTION_TYPE];
