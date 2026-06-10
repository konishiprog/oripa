import Stripe from "stripe";

let stripe: any = null;

function getStripe(): any {
  if (!stripe) {
    const secretKey = process.env.STRIPE_SECRET_KEY;
    if (!secretKey) {
      throw new Error("STRIPE_SECRET_KEY is not set in environment variables");
    }
    stripe = new Stripe(secretKey);
  }
  return stripe;
}

export interface CreatePaymentIntentRequest {
  userId: string;
  amount: number;
  coin: number;
  ticket?: number;
  currency?: string;
}

export async function createPaymentIntent(request: CreatePaymentIntentRequest) {
  const stripeInstance = getStripe();
  const currency = (request.currency || "jpy").toLowerCase();

  const isDecimalCurrency = ["usd", "eur", "gbp", "cad", "aud"].includes(
    currency,
  );
  const amount = isDecimalCurrency ? request.amount * 100 : request.amount;

  if (currency === "jpy" && amount < 50) {
    throw new Error(
      `Payment amount must be at least ¥50. Current: ¥${request.amount}`,
    );
  }

  const paymentIntent = await stripeInstance.paymentIntents.create({
    amount,
    currency,
    metadata: {
      userId: request.userId,
      coin: request.coin.toString(),
      ticket: (request.ticket || 0).toString(),
    },
  });

  return paymentIntent;
}

export async function retrievePaymentIntent(paymentIntentId: string) {
  const stripeInstance = getStripe();
  return await stripeInstance.paymentIntents.retrieve(paymentIntentId);
}

export function verifyWebhookSignature(
  body: string,
  signature: string,
  secret: string,
) {
  try {
    const stripeInstance = getStripe();
    return stripeInstance.webhooks.constructEvent(body, signature, secret);
  } catch (error) {
    throw error;
  }
}
