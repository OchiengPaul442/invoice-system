import nodemailer from "nodemailer";

interface SendEmailOptions {
  to: string[];
  subject: string;
  html: string;
  text: string;
  cc?: string[];
}

interface EmailResponse {
  id: string;
  provider: "resend" | "smtp";
}

async function sendViaResend({
  to,
  subject,
  html,
  text,
  cc,
  apiKey,
  from,
}: SendEmailOptions & { apiKey: string; from: string }): Promise<EmailResponse> {
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to,
      cc,
      subject,
      html,
      text,
    }),
  });

  const payload = (await response.json()) as { id?: string; message?: string };

  if (!response.ok) {
    throw new Error(payload.message || "Resend email send failed");
  }

  return {
    id: payload.id || `resend-${Date.now()}`,
    provider: "resend",
  };
}

async function sendViaSmtp({
  to,
  subject,
  html,
  text,
  cc,
  from,
}: SendEmailOptions & { from: string }): Promise<EmailResponse> {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || "587");
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const secure = process.env.SMTP_SECURE === "true";

  if (!host || !user || !pass) {
    throw new Error("Missing SMTP_HOST/SMTP_USER/SMTP_PASS");
  }

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass },
  });

  const result = await transporter.sendMail({
    from,
    to,
    cc,
    subject,
    text,
    html,
  });

  return {
    id: result.messageId || `smtp-${Date.now()}`,
    provider: "smtp",
  };
}

export async function sendTransactionalEmail(options: SendEmailOptions): Promise<EmailResponse> {
  const from = process.env.EMAIL_FROM;
  if (!from) {
    throw new Error("Missing EMAIL_FROM");
  }

  const resendApiKey = process.env.RESEND_API_KEY;
  if (resendApiKey) {
    return sendViaResend({ ...options, apiKey: resendApiKey, from });
  }

  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    return sendViaSmtp({ ...options, from });
  }

  throw new Error(
    "Missing email provider config. Set RESEND_API_KEY or SMTP_HOST/SMTP_USER/SMTP_PASS.",
  );
}
