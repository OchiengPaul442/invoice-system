import { create } from "zustand";
import { nanoid } from "nanoid";
import { BillToData, LineItem, Milestone } from "@/types/invoice";

interface InvoiceBuilderState {
  templateType: "CLASSIC" | "MODERN" | "MINIMAL" | "MILESTONE" | "RETAINER";
  billingType: "HOURLY" | "FIXED" | "RETAINER" | "MILESTONE" | "LICENSE";
  clientId: string | null;
  billTo: BillToData;
  invoiceNumber: string;
  issueDate: string;
  dueDate: string;
  servicePeriodStart: string | null;
  servicePeriodEnd: string | null;
  projectName: string;
  projectDescription: string;
  lineItems: LineItem[];
  milestones: Milestone[];
  currency: string;
  discountType: "percent" | "fixed" | null;
  discountValue: number;
  taxRate: number;
  taxLabel: string;
  notes: string;
  footer: string;
  paymentTerms: string;
  paymentInstructions: string;
  primaryColor: string;
  accentColor: string;
  showLogo: boolean;
  subtotal: number;
  discountAmount: number;
  taxAmount: number;
  total: number;
  setField: <K extends keyof InvoiceBuilderState>(
    key: K,
    value: InvoiceBuilderState[K],
  ) => void;
  addLineItem: () => void;
  updateLineItem: <K extends keyof LineItem>(
    id: string,
    field: K,
    value: LineItem[K],
  ) => void;
  removeLineItem: (id: string) => void;
  reorderLineItems: (from: number, to: number) => void;
  addMilestone: () => void;
  updateMilestone: <K extends keyof Milestone>(
    id: string,
    field: K,
    value: Milestone[K],
  ) => void;
  removeMilestone: (id: string) => void;
  recalculate: () => void;
  reset: () => void;
  loadInvoice: (
    invoice: Partial<
      Omit<
        InvoiceBuilderState,
        | "setField"
        | "addLineItem"
        | "updateLineItem"
        | "removeLineItem"
        | "reorderLineItems"
        | "addMilestone"
        | "updateMilestone"
        | "removeMilestone"
        | "recalculate"
        | "reset"
        | "loadInvoice"
      >
    >,
  ) => void;
}

const defaultLineItem = (): LineItem => ({
  id: nanoid(),
  description: "",
  quantity: 1,
  unit: "item",
  unitPrice: 0,
  amount: 0,
  taxable: true,
});

const initialState: Omit<
  InvoiceBuilderState,
  | "setField"
  | "addLineItem"
  | "updateLineItem"
  | "removeLineItem"
  | "reorderLineItems"
  | "addMilestone"
  | "updateMilestone"
  | "removeMilestone"
  | "recalculate"
  | "reset"
  | "loadInvoice"
> = {
  templateType: "CLASSIC",
  billingType: "FIXED",
  clientId: null,
  billTo: {
    name: "",
    email: "",
    company: "",
    address: "",
    city: "",
    country: "",
  },
  invoiceNumber: "",
  issueDate: new Date().toISOString().split("T")[0],
  dueDate: "",
  servicePeriodStart: null,
  servicePeriodEnd: null,
  projectName: "",
  projectDescription: "",
  lineItems: [defaultLineItem()],
  milestones: [],
  currency: "UGX",
  discountType: null,
  discountValue: 0,
  taxRate: 0,
  taxLabel: "VAT",
  notes: "",
  footer: "Thank you for your business.",
  paymentTerms: "Net 30",
  paymentInstructions: "",
  primaryColor: "#0F766E",
  accentColor: "#1F2937",
  showLogo: true,
  subtotal: 0,
  discountAmount: 0,
  taxAmount: 0,
  total: 0,
};

export const useInvoiceBuilderStore = create<InvoiceBuilderState>((set, get) => ({
  ...initialState,

  setField: (key, value) => {
    set({ [key]: value } as Pick<InvoiceBuilderState, typeof key>);
    get().recalculate();
  },

  addLineItem: () => {
    set((state) => ({ lineItems: [...state.lineItems, defaultLineItem()] }));
  },

  updateLineItem: (id, field, value) => {
    set((state) => ({
      lineItems: state.lineItems.map((item) => {
        if (item.id !== id) {
          return item;
        }
        const updated = { ...item, [field]: value } as LineItem;
        updated.amount = updated.quantity * updated.unitPrice;
        return updated;
      }),
    }));
    get().recalculate();
  },

  removeLineItem: (id) => {
    set((state) => ({ lineItems: state.lineItems.filter((item) => item.id !== id) }));
    get().recalculate();
  },

  reorderLineItems: (from, to) => {
    set((state) => {
      const items = [...state.lineItems];
      const [moved] = items.splice(from, 1);
      items.splice(to, 0, moved);
      return { lineItems: items };
    });
    get().recalculate();
  },

  addMilestone: () => {
    set((state) => ({
      milestones: [
        ...state.milestones,
        {
          id: nanoid(),
          name: "",
          description: "",
          dueDate: "",
          amount: 0,
          status: "pending",
        },
      ],
    }));
  },

  updateMilestone: (id, field, value) => {
    set((state) => ({
      milestones: state.milestones.map((milestone) =>
        milestone.id === id ? { ...milestone, [field]: value } : milestone,
      ),
    }));
  },

  removeMilestone: (id) => {
    set((state) => ({
      milestones: state.milestones.filter((milestone) => milestone.id !== id),
    }));
  },

  recalculate: () => {
    const state = get();
    const subtotal = state.lineItems.reduce((sum, item) => sum + item.amount, 0);
    let discountAmount = 0;
    if (state.discountType === "percent") {
      discountAmount = subtotal * (state.discountValue / 100);
    } else if (state.discountType === "fixed") {
      discountAmount = state.discountValue;
    }

    const taxableAmount = Math.max(0, subtotal - discountAmount);
    const taxAmount = taxableAmount * (state.taxRate / 100);
    const total = taxableAmount + taxAmount;

    set({ subtotal, discountAmount, taxAmount, total });
  },

  reset: () => {
    set({
      ...initialState,
      issueDate: new Date().toISOString().split("T")[0],
      lineItems: [defaultLineItem()],
    });
  },

  loadInvoice: (invoice) => {
    set((state) => ({ ...state, ...invoice }));
    get().recalculate();
  },
}));
