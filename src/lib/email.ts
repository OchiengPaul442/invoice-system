interface SendEmailOptions {
  to: string[];
  subject: string;
  html: string;
  text: string;
  cc?: string[];
}

interface ResendResponse {
  id?: string;
  message?: string;
}

export async function sendTransactionalEmail({
  to,
  subject,
  html,
  text,
  cc,
}: SendEmailOptions): Promise<ResendResponse> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;

  if (!apiKey) {
    throw new Error("Missing RESEND_API_KEY");
  }

  if (!from) {
    throw new Error("Missing EMAIL_FROM");
  }

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

  const payload = (await response.json()) as ResendResponse;

  if (!response.ok) {
    throw new Error(payload.message || "Email send failed");
  }

  return payload;
}
