export interface PDFLineItem {
  id?: string;
  description: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  amount: number;
}

export interface PDFMilestone {
  id?: string;
  name: string;
  description?: string;
  dueDate: string;
  amount: number;
  status: "pending" | "completed" | "invoiced";
}

export interface PDFInvoice {
  id: string;
  invoiceNumber: string;
  templateType: string;
  status: string;
  issueDate: string | Date;
  dueDate: string | Date;
  servicePeriodStart?: string | Date | null;
  servicePeriodEnd?: string | Date | null;
  billToName: string;
  billToEmail: string;
  billToCompany?: string | null;
  billToAddress?: string | null;
  billToCity?: string | null;
  billToCountry?: string | null;
  billToTaxId?: string | null;
  projectName?: string | null;
  projectDescription?: string | null;
  lineItems: PDFLineItem[];
  milestones?: PDFMilestone[] | null;
  currency: string;
  subtotal: number;
  discountAmount?: number | null;
  taxLabel: string;
  taxRate: number;
  taxAmount: number;
  total: number;
  paymentInstructions?: string | null;
  notes?: string | null;
  footer?: string | null;
  showLogo: boolean;
  primaryColor?: string | null;
  accentColor?: string | null;
}

export interface PDFProfile {
  senderName?: string | null;
  senderEmail?: string | null;
  isFreelancer?: boolean | null;
  businessName?: string | null;
  businessAddress?: string | null;
  businessCity?: string | null;
  businessCountry?: string | null;
  businessEmail?: string | null;
  businessPhone?: string | null;
  mobileMoneyProvider?: string | null;
  mobileMoneyNumber?: string | null;
  taxId?: string | null;
  logoPath?: string | null;
  primaryColor?: string | null;
  accentColor?: string | null;
  bankName?: string | null;
  bankAccount?: string | null;
  swiftCode?: string | null;
  paymentNotes?: string | null;
}

export interface PDFTemplateProps {
  invoice: PDFInvoice;
  profile: PDFProfile | null;
}
