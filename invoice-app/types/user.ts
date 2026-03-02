export interface UserProfile {
  id: string;
  userId: string;
  businessName?: string | null;
  businessAddress?: string | null;
  businessCity?: string | null;
  businessState?: string | null;
  businessCountry: string;
  businessZip?: string | null;
  businessPhone?: string | null;
  businessEmail?: string | null;
  businessWebsite?: string | null;
  taxId?: string | null;
  currency: string;
  logoPath?: string | null;
  primaryColor: string;
  accentColor: string;
  bankName?: string | null;
  bankAccount?: string | null;
  bankBranch?: string | null;
  swiftCode?: string | null;
  paymentNotes?: string | null;
}

export interface InvoiceSettings {
  id: string;
  userId: string;
  defaultTemplate: "CLASSIC" | "MODERN" | "MINIMAL" | "MILESTONE" | "RETAINER";
  defaultPaymentTerms: number;
  defaultTaxRate: number;
  defaultTaxLabel: string;
  defaultCurrency: string;
  invoicePrefix: string;
  currentSequence: number;
  currentYear: number;
  defaultFooter?: string | null;
  sendCopyToSelf: boolean;
}
