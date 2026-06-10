import { Resend } from "resend";
import * as fs from "fs";
import * as path from "path";
import texts from "./templates/texts.json";
const messages = require("../../constants/messages.json");

type TemplateTexts = { subject: string; [key: string]: string };

let resend: Resend | null = null;
const fileCache: Map<string, string> = new Map();

function getResendClient(): Resend {
  if (!resend) {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      throw new Error("RESEND_API_KEY is not set in environment variables");
    }
    resend = new Resend(apiKey);
  }
  return resend;
}

function validateEmail(email: string): boolean {
  if (!email || typeof email !== "string") {
    return false;
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function loadTemplateFile(name: string, ext: "html" | "css"): string {
  const cacheKey = `${name}.${ext}`;
  const cached = fileCache.get(cacheKey);
  if (cached !== undefined) {
    return cached;
  }
  const filePath = path.join(__dirname, "templates", name, `${name}.${ext}`);
  const content = fs.existsSync(filePath)
    ? fs.readFileSync(filePath, "utf-8")
    : "";
  fileCache.set(cacheKey, content);
  return content;
}

function renderTemplate(
  name: string,
  variables: Record<string, string>,
): { subject: string; html: string } {
  const html = loadTemplateFile(name, "html");
  const css = loadTemplateFile(name, "css");
  const allTexts = texts as Record<string, any>;
  const templateTexts = allTexts[name] as TemplateTexts;
  const commonTexts = allTexts["common"] || {};

  if (!templateTexts) {
    throw new Error(`Email template texts not found for: ${name}`);
  }

  const withStyles = css
    ? html.replace("</head>", `  <style>${css}</style>\n</head>`)
    : html;

  const allVars = { ...commonTexts, ...templateTexts, ...variables };
  const rendered = Object.entries(allVars).reduce(
    (acc, [key, value]) =>
      acc.replace(new RegExp(`{{${key}}}`, "g"), String(value)),
    withStyles,
  );

  return { subject: templateTexts.subject, html: rendered };
}

export async function sendSignupEmail(
  to: string,
  verifyUrl: string,
  userName: string,
): Promise<void> {
  if (!process.env.RESEND_API_KEY) {
    console.error("[EMAIL] RESEND_API_KEY is not set");
    throw new Error("RESEND_API_KEY is not configured");
  }

  if (!validateEmail(to)) {
    console.error("[EMAIL] Invalid email address:", to);
    throw new Error("Invalid email address format");
  }

  try {
    const client = getResendClient();
    const emailFrom = process.env.EMAIL_FROM;
    if (!emailFrom) {
      throw new Error("EMAIL_FROM is not configured");
    }

    const { subject, html } = renderTemplate("signup", { userName, verifyUrl });

    const result = await client.emails.send({
      from: emailFrom,
      to,
      subject,
      html,
    });

    console.log(`[EMAIL] Send result:`, result);
  } catch (error: any) {
    console.error("[EMAIL] Failed to send signup email:", error);
    console.error("[EMAIL] Error details:", error.message || error);
    throw new Error(messages.email.SEND_FAILURE_ERROR);
  }
}

export async function sendPhoneChangeEmail(
  to: string,
  userName: string,
  oldPhone: string,
  newPhone: string,
): Promise<void> {
  if (!process.env.RESEND_API_KEY) {
    console.error("[EMAIL] RESEND_API_KEY is not set");
    throw new Error("RESEND_API_KEY is not configured");
  }

  if (!validateEmail(to)) {
    console.error("[EMAIL] Invalid email address:", to);
    throw new Error("Invalid email address format");
  }

  try {
    const client = getResendClient();
    const emailFrom = process.env.EMAIL_FROM;
    if (!emailFrom) {
      throw new Error("EMAIL_FROM is not configured");
    }

    const { subject, html } = renderTemplate("phoneChange", {
      userName,
      oldPhone,
      newPhone,
    });

    const result = await client.emails.send({
      from: emailFrom,
      to,
      subject,
      html,
    });

    console.log(`[EMAIL] Send result:`, result);
  } catch (error: any) {
    console.error("[EMAIL] Failed to send phone change email:", error);
    console.error("[EMAIL] Error details:", error.message || error);
    throw new Error(messages.email.SEND_FAILURE_ERROR);
  }
}

export async function sendAddressChangeEmail(
  to: string,
  userName: string,
  oldAddress: string,
  newAddress: string,
): Promise<void> {
  if (!process.env.RESEND_API_KEY) {
    console.error("[EMAIL] RESEND_API_KEY is not set");
    throw new Error("RESEND_API_KEY is not configured");
  }

  if (!validateEmail(to)) {
    console.error("[EMAIL] Invalid email address:", to);
    throw new Error("Invalid email address format");
  }

  try {
    const client = getResendClient();
    const emailFrom = process.env.EMAIL_FROM;
    if (!emailFrom) {
      throw new Error("EMAIL_FROM is not configured");
    }

    const { subject, html } = renderTemplate("address", {
      userName,
      oldAddress,
      newAddress,
    });

    const result = await client.emails.send({
      from: emailFrom,
      to,
      subject,
      html,
    });

    console.log(`[EMAIL] Send result:`, result);
  } catch (error: any) {
    console.error("[EMAIL] Failed to send address change email:", error);
    console.error("[EMAIL] Error details:", error.message || error);
    throw new Error(messages.email.SEND_FAILURE_ERROR);
  }
}

export async function sendPasswordChangeEmail(
  to: string,
  userName: string,
): Promise<void> {
  if (!process.env.RESEND_API_KEY) {
    console.error("[EMAIL] RESEND_API_KEY is not set");
    throw new Error("RESEND_API_KEY is not configured");
  }

  if (!validateEmail(to)) {
    console.error("[EMAIL] Invalid email address:", to);
    throw new Error("Invalid email address format");
  }

  try {
    const client = getResendClient();
    const emailFrom = process.env.EMAIL_FROM;
    if (!emailFrom) {
      throw new Error("EMAIL_FROM is not configured");
    }

    const { subject, html } = renderTemplate("password", { userName });

    const result = await client.emails.send({
      from: emailFrom,
      to,
      subject,
      html,
    });

    console.log(`[EMAIL] Send result:`, result);
  } catch (error: any) {
    console.error("[EMAIL] Failed to send password change email:", error);
    console.error("[EMAIL] Error details:", error.message || error);
    throw new Error(messages.email.SEND_FAILURE_ERROR);
  }
}

export async function sendAdminCardShippingRequestEmail(
  adminEmails: string[],
  userName: string,
  cardName: string,
  gachaName: string,
  address: string,
  phone: string,
): Promise<void> {
  if (!process.env.RESEND_API_KEY) {
    console.error("[EMAIL] RESEND_API_KEY is not set");
    throw new Error("RESEND_API_KEY is not configured");
  }

  const invalidEmails = adminEmails.filter((email) => !validateEmail(email));
  if (invalidEmails.length > 0) {
    console.error("[EMAIL] Invalid email addresses:", invalidEmails);
    throw new Error("Invalid email address format");
  }

  try {
    const client = getResendClient();
    const emailFrom = process.env.EMAIL_FROM;
    if (!emailFrom) {
      throw new Error("EMAIL_FROM is not configured");
    }

    const { subject, html } = renderTemplate("adminCardShippingRequest", {
      userName,
      cardName,
      gachaName,
      address,
      phone,
    });

    for (const adminEmail of adminEmails) {
      const result = await client.emails.send({
        from: emailFrom,
        to: adminEmail,
        subject,
        html,
      });
      console.log(`[EMAIL] Send result to ${adminEmail}:`, result);
    }
  } catch (error: any) {
    console.error(
      "[EMAIL] Failed to send admin card shipping request email:",
      error,
    );
    console.error("[EMAIL] Error details:", error.message || error);
    throw new Error(messages.email.SEND_FAILURE_ERROR);
  }
}

export async function sendCardExchangeEmail(
  to: string,
  userName: string,
  cardCount: number,
  gainedCoin: number,
  totalCoin: number,
): Promise<void> {
  if (!process.env.RESEND_API_KEY) {
    console.error("[EMAIL] RESEND_API_KEY is not set");
    throw new Error("RESEND_API_KEY is not configured");
  }

  if (!validateEmail(to)) {
    console.error("[EMAIL] Invalid email address:", to);
    throw new Error("Invalid email address format");
  }

  try {
    const client = getResendClient();
    const emailFrom = process.env.EMAIL_FROM;
    if (!emailFrom) {
      throw new Error("EMAIL_FROM is not configured");
    }

    const { subject, html } = renderTemplate("cardExchange", {
      userName,
      cardCount: cardCount.toLocaleString("ja-JP"),
      gainedCoin: gainedCoin.toLocaleString("ja-JP"),
      totalCoin: totalCoin.toLocaleString("ja-JP"),
    });

    const result = await client.emails.send({
      from: emailFrom,
      to,
      subject,
      html,
    });

    console.log(`[EMAIL] Send result:`, result);
  } catch (error: any) {
    console.error("[EMAIL] Failed to send card exchange email:", error);
    console.error("[EMAIL] Error details:", error.message || error);
    throw new Error(messages.email.SEND_FAILURE_ERROR);
  }
}

export async function sendCoinPurchaseEmail(
  to: string,
  userName: string,
  price: number,
  coin: number,
  ticket: number,
  totalCoin: number,
): Promise<void> {
  if (!process.env.RESEND_API_KEY) {
    console.error("[EMAIL] RESEND_API_KEY is not set");
    throw new Error("RESEND_API_KEY is not configured");
  }

  if (!validateEmail(to)) {
    console.error("[EMAIL] Invalid email address:", to);
    throw new Error("Invalid email address format");
  }

  try {
    const client = getResendClient();
    const emailFrom = process.env.EMAIL_FROM;
    if (!emailFrom) {
      throw new Error("EMAIL_FROM is not configured");
    }

    const { subject, html } = renderTemplate("coinPurchase", {
      userName,
      price: price.toLocaleString("ja-JP"),
      coin: coin.toLocaleString("ja-JP"),
      ticket: ticket.toLocaleString("ja-JP"),
      totalCoin: totalCoin.toLocaleString("ja-JP"),
    });

    const result = await client.emails.send({
      from: emailFrom,
      to,
      subject,
      html,
    });

    console.log(`[EMAIL] Send result:`, result);
  } catch (error: any) {
    console.error("[EMAIL] Failed to send coin purchase email:", error);
    console.error("[EMAIL] Error details:", error.message || error);
    throw new Error(messages.email.SEND_FAILURE_ERROR);
  }
}

export async function sendEmailChangeEmail(
  to: string,
  verifyUrl: string,
  userName: string,
): Promise<void> {
  if (!process.env.RESEND_API_KEY) {
    console.error("[EMAIL] RESEND_API_KEY is not set");
    throw new Error("RESEND_API_KEY is not configured");
  }

  if (!validateEmail(to)) {
    console.error("[EMAIL] Invalid email address:", to);
    throw new Error("Invalid email address format");
  }

  try {
    const client = getResendClient();
    const emailFrom = process.env.EMAIL_FROM;
    if (!emailFrom) {
      throw new Error("EMAIL_FROM is not configured");
    }

    const { subject, html } = renderTemplate("emailChange", {
      userName,
      verifyUrl,
    });

    const result = await client.emails.send({
      from: emailFrom,
      to,
      subject,
      html,
    });

    console.log(`[EMAIL] Send result:`, result);
  } catch (error: any) {
    console.error("[EMAIL] Failed to send email change email:", error);
    console.error("[EMAIL] Error details:", error.message || error);
    throw new Error(messages.email.SEND_FAILURE_ERROR);
  }
}

export async function sendPasswordResetEmail(
  to: string,
  userName: string,
  newPassword: string,
): Promise<void> {
  if (!process.env.RESEND_API_KEY) {
    console.error("[EMAIL] RESEND_API_KEY is not set");
    throw new Error("RESEND_API_KEY is not configured");
  }

  if (!validateEmail(to)) {
    console.error("[EMAIL] Invalid email address:", to);
    throw new Error("Invalid email address format");
  }

  try {
    const client = getResendClient();
    const emailFrom = process.env.EMAIL_FROM;
    if (!emailFrom) {
      throw new Error("EMAIL_FROM is not configured");
    }

    const { subject, html } = renderTemplate("passwordReset", {
      userName,
      newPassword,
    });

    const result = await client.emails.send({
      from: emailFrom,
      to,
      subject,
      html,
    });

    console.log(`[EMAIL] Send result:`, result);
  } catch (error: any) {
    console.error("[EMAIL] Failed to send password reset email:", error);
    console.error("[EMAIL] Error details:", error.message || error);
    throw new Error(messages.email.SEND_FAILURE_ERROR);
  }
}

export async function sendContactEmail(
  adminEmails: string[],
  userName: string,
  userEmail: string,
  title: string,
  content: string,
): Promise<void> {
  if (!process.env.RESEND_API_KEY) {
    console.error("[EMAIL] RESEND_API_KEY is not set");
    throw new Error("RESEND_API_KEY is not configured");
  }

  const invalidEmails = adminEmails.filter((email) => !validateEmail(email));
  if (invalidEmails.length > 0) {
    console.error("[EMAIL] Invalid email addresses:", invalidEmails);
    throw new Error("Invalid email address format");
  }

  try {
    const client = getResendClient();
    const emailFrom = process.env.EMAIL_FROM;
    if (!emailFrom) {
      throw new Error("EMAIL_FROM is not configured");
    }

    const { subject, html } = renderTemplate("contact", {
      userName,
      userEmail,
      inquiryTitle: title,
      content,
    });

    for (const adminEmail of adminEmails) {
      const result = await client.emails.send({
        from: emailFrom,
        to: adminEmail,
        replyTo: userEmail,
        subject,
        html,
      });
      console.log(`[EMAIL] Send result to ${adminEmail}:`, result);
    }
  } catch (error: any) {
    console.error("[EMAIL] Failed to send contact email:", error);
    console.error("[EMAIL] Error details:", error.message || error);
    throw new Error(messages.email.SEND_FAILURE_ERROR);
  }
}
