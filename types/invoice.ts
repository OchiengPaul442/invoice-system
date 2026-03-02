export interface LineItem {
  id: string;
  description: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  amount: number;
  taxable: boolean;
}

export interface Milestone {
  id: string;
  name: string;
  description: string;
  dueDate: string;
  amount: number;
  status: "pending" | "completed" | "invoiced";
}

export type InvoiceStatus =
  | "DRAFT"
  | "SENT"
  | "VIEWED"
  | "PARTIAL"
  | "PAID"
  | "OVERDUE"
  | "CANCELLED";

export type TemplateType =
  | "CLASSIC"
  | "MODERN"
  | "MINIMAL"
  | "MILESTONE"
  | "RETAINER";

export type BillingType =
  | "HOURLY"
  | "FIXED"
  | "RETAINER"
  | "MILESTONE"
  | "LICENSE";

export interface BillToData {
  name: string;
  email: string;
  company?: string;
  address?: string;
  city?: string;
  country?: string;
  taxId?: string;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  status: InvoiceStatus;
  templateType: TemplateType;
  billingType: BillingType;
  issueDate: string;
  dueDate: string;
  servicePeriodStart?: string | null;
  servicePeriodEnd?: string | null;
  clientId?: string | null;
  billToName: string;
  billToEmail: string;
  billToCompany?: string;
  billToAddress?: string;
  billToCity?: string;
  billToCountry?: string;
  billToTaxId?: string;
  lineItems: LineItem[];
  milestones?: Milestone[];
  currency: string;
  subtotal: number;
  discountType?: "percent" | "fixed" | null;
  discountValue?: number | null;
  discountAmount: number;
  taxRate: number;
  taxLabel: string;
  taxAmount: number;
  total: number;
  amountPaid?: number;
  balanceDue: number;
  primaryColor?: string | null;
  accentColor?: string | null;
  showLogo: boolean;
  showSignature?: boolean;
  notes?: string;
  footer?: string;
  paymentTerms?: string;
  paymentInstructions?: string;
  projectName?: string;
  projectDescription?: string;
  createdAt: string;
  updatedAt: string;
}
