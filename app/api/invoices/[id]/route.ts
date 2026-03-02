import { Prisma } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { calculateInvoiceTotals } from "@/lib/calculations";
import { prisma } from "@/lib/prisma";
import { invoiceUpdateSchema } from "@/schemas/invoice.schema";
import { LineItem } from "@/types/invoice";

function normalizeLineItems(lineItems: LineItem[]): LineItem[] {
  return lineItems.map((item) => ({
    ...item,
    quantity: Number(item.quantity),
    unitPrice: Number(item.unitPrice),
    amount: Number(item.quantity) * Number(item.unitPrice),
  }));
}

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } },
): Promise<NextResponse> {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 },
    );
  }

  try {
    const invoice = await prisma.invoice.findFirst({
      where: { id: params.id, userId: session.user.id },
      include: {
        client: true,
        payments: true,
        activityLog: { orderBy: { createdAt: "desc" } },
      },
    });

    if (!invoice) {
      return NextResponse.json(
        { success: false, error: "Invoice not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true, data: invoice });
  } catch (error) {
    console.error("Fetch invoice failed:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch invoice" },
      { status: 500 },
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } },
): Promise<NextResponse> {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 },
    );
  }

  try {
    const existing = await prisma.invoice.findFirst({
      where: { id: params.id, userId: session.user.id },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Invoice not found" },
        { status: 404 },
      );
    }

    if (existing.status === "PAID" || existing.status === "CANCELLED") {
      return NextResponse.json(
        { success: false, error: "Paid or cancelled invoices cannot be edited" },
        { status: 403 },
      );
    }

    const body: unknown = await req.json();
    const parsed = invoiceUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Validation failed",
          details: parsed.error.errors,
        },
        { status: 400 },
      );
    }

    const data = parsed.data;
    const updateData: Prisma.InvoiceUncheckedUpdateInput = {};

    if (data.clientId !== undefined) updateData.clientId = data.clientId;
    if (data.templateType !== undefined) updateData.templateType = data.templateType;
    if (data.billingType !== undefined) updateData.billingType = data.billingType;
    if (data.issueDate !== undefined) updateData.issueDate = new Date(data.issueDate);
    if (data.dueDate !== undefined) updateData.dueDate = new Date(data.dueDate);
    if (data.servicePeriodStart !== undefined) {
      updateData.servicePeriodStart = data.servicePeriodStart
        ? new Date(data.servicePeriodStart)
        : null;
    }
    if (data.servicePeriodEnd !== undefined) {
      updateData.servicePeriodEnd = data.servicePeriodEnd
        ? new Date(data.servicePeriodEnd)
        : null;
    }
    if (data.billToName !== undefined) updateData.billToName = data.billToName;
    if (data.billToEmail !== undefined) updateData.billToEmail = data.billToEmail;
    if (data.billToCompany !== undefined) updateData.billToCompany = data.billToCompany;
    if (data.billToAddress !== undefined) updateData.billToAddress = data.billToAddress;
    if (data.billToCity !== undefined) updateData.billToCity = data.billToCity;
    if (data.billToCountry !== undefined) updateData.billToCountry = data.billToCountry;
    if (data.billToTaxId !== undefined) updateData.billToTaxId = data.billToTaxId;
    if (data.currency !== undefined) updateData.currency = data.currency;
    if (data.discountType !== undefined) updateData.discountType = data.discountType;
    if (data.discountValue !== undefined) updateData.discountValue = data.discountValue;
    if (data.taxRate !== undefined) updateData.taxRate = data.taxRate;
    if (data.taxLabel !== undefined) updateData.taxLabel = data.taxLabel;
    if (data.projectName !== undefined) updateData.projectName = data.projectName;
    if (data.projectDescription !== undefined) {
      updateData.projectDescription = data.projectDescription;
    }
    if (data.notes !== undefined) updateData.notes = data.notes;
    if (data.footer !== undefined) updateData.footer = data.footer;
    if (data.paymentTerms !== undefined) updateData.paymentTerms = data.paymentTerms;
    if (data.paymentInstructions !== undefined) {
      updateData.paymentInstructions = data.paymentInstructions;
    }
    if (data.primaryColor !== undefined) updateData.primaryColor = data.primaryColor;
    if (data.accentColor !== undefined) updateData.accentColor = data.accentColor;
    if (data.showLogo !== undefined) updateData.showLogo = data.showLogo;

    const nextStatus = data.status ?? existing.status;
    if (nextStatus !== undefined) {
      updateData.status = nextStatus;
    }

    if (data.milestones !== undefined) {
      updateData.milestones = (data.milestones ??
        null) as unknown as Prisma.NullableJsonNullValueInput | Prisma.InputJsonValue;
    }

    if (data.lineItems !== undefined) {
      const normalized = normalizeLineItems(data.lineItems);
      const existingDiscountType =
        existing.discountType === "percent" || existing.discountType === "fixed"
          ? existing.discountType
          : null;
      const totals = calculateInvoiceTotals(
        normalized,
        data.taxRate ?? Number(existing.taxRate),
        data.discountType ?? existingDiscountType,
        data.discountValue ?? (existing.discountValue ? Number(existing.discountValue) : 0),
      );

      updateData.lineItems = normalized as unknown as Prisma.InputJsonValue;
      updateData.subtotal = totals.subtotal;
      updateData.discountAmount = totals.discountAmount;
      updateData.taxAmount = totals.taxAmount;
      updateData.total = totals.total;
      updateData.balanceDue = Math.max(0, totals.total - Number(existing.amountPaid));
    }

    if (nextStatus === "SENT" && existing.status !== "SENT") {
      updateData.sentAt = new Date();
    }

    if (nextStatus === "PAID") {
      const paidTotal = updateData.total ? Number(updateData.total) : Number(existing.total);
      updateData.paidAt = new Date();
      updateData.amountPaid = paidTotal;
      updateData.balanceDue = 0;
    }

    const invoice = await prisma.invoice.update({
      where: { id: params.id },
      data: updateData,
    });

    await prisma.invoiceActivity.create({
      data: {
        invoiceId: invoice.id,
        action: "updated",
        note: data.status ? `Status changed to ${data.status}` : undefined,
      },
    });

    return NextResponse.json({ success: true, data: { id: invoice.id } });
  } catch (error) {
    console.error("Update invoice failed:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update invoice" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } },
): Promise<NextResponse> {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 },
    );
  }

  try {
    const existing = await prisma.invoice.findFirst({
      where: { id: params.id, userId: session.user.id },
      select: { id: true, status: true },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Invoice not found" },
        { status: 404 },
      );
    }

    if (existing.status !== "DRAFT") {
      return NextResponse.json(
        { success: false, error: "Only draft invoices can be deleted" },
        { status: 403 },
      );
    }

    await prisma.invoice.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true, data: { deleted: true } });
  } catch (error) {
    console.error("Delete invoice failed:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete invoice" },
      { status: 500 },
    );
  }
}
