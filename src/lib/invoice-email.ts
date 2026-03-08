import { formatCurrency, formatDate } from "@/lib/utils";

export type InvoiceEmailKind = "invoice" | "due_soon" | "overdue";

export interface SenderIdentityInput {
  appName: string;
  userName?: string | null;
  userEmail?: string | null;
  isFreelancer?: boolean | null;
  businessName?: string | null;
  businessEmail?: string | null;
}

export interface SenderIdentity {
  appName: string;
  displayName: string;
  signatureName: string;
  replyTo?: string;
  contactEmail?: string;
}

export interface InvoiceEmailContentInput {
  kind: InvoiceEmailKind;
  recipientName: string;
  invoiceNumber: string;
  amountDue: number;
  currency: string;
  dueDate: Date;
  sender: SenderIdentity;
  includeAttachmentNote?: boolean;
  customSubject?: string;
  customMessage?: string;
}

function clean(value?: string | null): string {
  return (value || "").trim();
}

export function resolveSenderIdentity(input: SenderIdentityInput): SenderIdentity {
  const businessName = clean(input.businessName);
  const businessEmail = clean(input.businessEmail);
  const userName = clean(input.userName);
  const userEmail = clean(input.userEmail);

  const displayName =
    input.isFreelancer || !businessName
      ? userName || businessName || input.appName
      : businessName;
  const contactEmail =
    input.isFreelancer || !businessEmail
      ? userEmail || businessEmail || undefined
      : businessEmail;

  return {
    appName: input.appName,
    displayName,
    signatureName: displayName,
    replyTo: contactEmail,
    contactEmail,
  };
}

function subjectLine(kind: InvoiceEmailKind, invoiceNumber: string, senderName: string, dueDate: Date): string {
  if (kind === "due_soon") {
    return `Reminder: Invoice ${invoiceNumber} is due ${formatDate(dueDate)}`;
  }
  if (kind === "overdue") {
    return `Payment reminder: Invoice ${invoiceNumber} is overdue`;
  }
  return `Invoice ${invoiceNumber} from ${senderName}`;
}

function introCopy(kind: InvoiceEmailKind, dueDate: Date): string {
  if (kind === "due_soon") {
    return `This is a friendly reminder that payment is due on ${formatDate(dueDate)}.`;
  }
  if (kind === "overdue") {
    return `This invoice was due on ${formatDate(dueDate)} and is currently overdue.`;
  }
  return "Please find your invoice attached for your records.";
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function applyTemplate(input: string, variables: Record<string, string>): string {
  return input.replace(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g, (_, key: string) => variables[key] || "");
}

export function buildInvoiceEmailContent(input: InvoiceEmailContentInput): {
  subject: string;
  html: string;
  text: string;
} {
  const safeRecipient = input.recipientName || "there";
  const safeSender = input.sender.displayName || input.sender.appName;
  const amount = formatCurrency(input.amountDue, input.currency);
  const dueDateLabel = formatDate(input.dueDate);
  const variables = {
    clientName: safeRecipient,
    invoiceNumber: input.invoiceNumber,
    amountDue: amount,
    dueDate: dueDateLabel,
    senderName: safeSender,
    appName: input.sender.appName,
  };
  const subject = clean(input.customSubject)
    ? applyTemplate(clean(input.customSubject), variables)
    : subjectLine(input.kind, input.invoiceNumber, safeSender, input.dueDate);
  const includeAttachmentNote = input.includeAttachmentNote ?? input.kind === "invoice";
  const resolvedIntro = clean(input.customMessage)
    ? applyTemplate(clean(input.customMessage), variables)
    : introCopy(input.kind, input.dueDate);
  const introHtml = escapeHtml(resolvedIntro).replaceAll("\n", "<br />");

  const html = `
  <div style="font-family:Arial,'Segoe UI',sans-serif;line-height:1.6;color:#0f172a;max-width:640px;margin:0 auto">
    <p style="margin:0 0 12px;font-size:16px">Hello ${escapeHtml(safeRecipient)},</p>
    <p style="margin:0 0 16px;font-size:15px;color:#334155">${introHtml}</p>
    <table style="width:100%;border-collapse:separate;border-spacing:0;border:1px solid #e2e8f0;border-radius:12px;overflow:hidden">
      <tr>
        <td style="padding:12px 14px;color:#475569;font-size:14px;border-bottom:1px solid #e2e8f0">Amount due</td>
        <td style="padding:12px 14px;text-align:right;font-size:20px;font-weight:700;color:#0f172a;border-bottom:1px solid #e2e8f0">${amount}</td>
      </tr>
      <tr>
        <td style="padding:12px 14px;color:#475569;font-size:14px;border-bottom:1px solid #e2e8f0">Due date</td>
        <td style="padding:12px 14px;text-align:right;font-size:15px;font-weight:600;color:#0f172a;border-bottom:1px solid #e2e8f0">${dueDateLabel}</td>
      </tr>
      <tr>
        <td style="padding:12px 14px;color:#475569;font-size:14px">Invoice number</td>
        <td style="padding:12px 14px;text-align:right;font-size:15px;font-weight:600;color:#0f172a">${input.invoiceNumber}</td>
      </tr>
    </table>
    ${
      includeAttachmentNote
        ? '<p style="margin:16px 0 0;font-size:14px;color:#475569">The official PDF invoice is attached to this email.</p>'
        : '<p style="margin:16px 0 0;font-size:14px;color:#475569">Kindly process payment at your earliest convenience and include the invoice number as reference.</p>'
    }
    <p style="margin:20px 0 0;font-size:14px;color:#0f172a">Regards,<br />${escapeHtml(input.sender.signatureName)}</p>
    ${
      input.sender.contactEmail
        ? `<p style="margin:4px 0 0;font-size:12px;color:#64748b">${escapeHtml(input.sender.contactEmail)}</p>`
        : ""
    }
  </div>
  `.trim();

  const textLines = [
    `Hello ${safeRecipient},`,
    "",
    resolvedIntro,
    `Amount due: ${amount}`,
    `Due date: ${dueDateLabel}`,
    `Invoice number: ${input.invoiceNumber}`,
    includeAttachmentNote
      ? "The official PDF invoice is attached to this email."
      : "Please include the invoice number when making payment.",
    "",
    `Regards, ${input.sender.signatureName}`,
    input.sender.contactEmail ? input.sender.contactEmail : null,
  ].filter(Boolean);

  return {
    subject,
    html,
    text: textLines.join("\n"),
  };
}
