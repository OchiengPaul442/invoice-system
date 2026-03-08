import { Prisma } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { calculateInvoiceTotals } from "@/lib/calculations";
import { syncInvoicePdfToCloudinary } from "@/lib/invoice-pdf";
import { generateInvoiceNumber } from "@/lib/invoice-number";
import { prisma } from "@/lib/prisma";
import { invoiceCreateSchema } from "@/schemas/invoice.schema";
import { LineItem } from "@/types/invoice";

function normalizeLineItems(lineItems: LineItem[]): LineItem[] {
  return lineItems.map((item) => ({
    ...item,
    quantity: Number(item.quantity),
    unitPrice: Number(item.unitPrice),
    amount: Number(item.quantity) * Number(item.unitPrice),
  }));
}

export async function GET(req: NextRequest): Promise<NextResponse> {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 },
    );
  }

  try {
    const { searchParams } = new URL(req.url);
    const page = Math.max(1, Number.parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(
      100,
      Math.max(1, Number.parseInt(searchParams.get("limit") || "20", 10)),
    );
    const status = searchParams.get("status");
    const clientId = searchParams.get("clientId");
    const search = searchParams.get("search");
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") === "asc" ? "asc" : "desc";

    const where: Prisma.InvoiceWhereInput = { userId: session.user.id };
    if (status) {
      where.status = status as Prisma.EnumInvoiceStatusFilter;
    }
    if (clientId) {
      where.clientId = clientId;
    }
    if (search) {
      where.OR = [
        { invoiceNumber: { contains: search, mode: "insensitive" } },
        { billToName: { contains: search, mode: "insensitive" } },
        { billToEmail: { contains: search, mode: "insensitive" } },
        { billToCompany: { contains: search, mode: "insensitive" } },
        { projectName: { contains: search, mode: "insensitive" } },
      ];
    }

    const allowedSortFields = new Set(["createdAt", "dueDate", "total", "invoiceNumber"]);
    const orderByField = allowedSortFields.has(sortBy) ? sortBy : "createdAt";

    const [invoices, total] = await Promise.all([
      prisma.invoice.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { [orderByField]: sortOrder },
        include: {
          client: {
            select: {
              id: true,
              name: true,
              company: true,
              email: true,
            },
          },
        },
      }),
      prisma.invoice.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        invoices,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error("Fetch invoices failed:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch invoices" },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 },
    );
  }

  try {
    const body: unknown = await req.json();
    const parsed = invoiceCreateSchema.safeParse(body);
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
    const lineItems = normalizeLineItems(data.lineItems);
    const totals = calculateInvoiceTotals(
      lineItems,
      data.taxRate,
      data.discountType ?? null,
      data.discountValue,
    );
    const invoiceNumber = await generateInvoiceNumber(session.user.id);

    const invoice = await prisma.invoice.create({
      data: {
        userId: session.user.id,
        clientId: data.clientId,
        invoiceNumber,
        status: data.status ?? "DRAFT",
        templateType: data.templateType,
        billingType: data.billingType,
        issueDate: new Date(data.issueDate),
        dueDate: new Date(data.dueDate),
        servicePeriodStart: data.servicePeriodStart
          ? new Date(data.servicePeriodStart)
          : null,
        servicePeriodEnd: data.servicePeriodEnd ? new Date(data.servicePeriodEnd) : null,
        billToName: data.billToName,
        billToEmail: data.billToEmail,
        billToCompany: data.billToCompany,
        billToAddress: data.billToAddress,
        billToCity: data.billToCity,
        billToCountry: data.billToCountry,
        billToTaxId: data.billToTaxId,
        lineItems: lineItems as unknown as Prisma.InputJsonValue,
        milestones: (data.milestones ??
          null) as unknown as Prisma.NullableJsonNullValueInput | Prisma.InputJsonValue,
        currency: data.currency,
        subtotal: totals.subtotal,
        discountType: data.discountType,
        discountValue: data.discountValue,
        discountAmount: totals.discountAmount,
        taxLabel: data.taxLabel,
        taxRate: data.taxRate,
        taxAmount: totals.taxAmount,
        total: totals.total,
        balanceDue: totals.balanceDue,
        primaryColor: data.primaryColor,
        accentColor: data.accentColor,
        showLogo: data.showLogo ?? true,
        projectName: data.projectName,
        projectDescription: data.projectDescription,
        notes: data.notes,
        footer: data.footer,
        paymentTerms: data.paymentTerms,
        paymentInstructions: data.paymentInstructions,
      },
    });

    await prisma.invoiceActivity.create({
      data: {
        invoiceId: invoice.id,
        action: "created",
      },
    });

    try {
      await syncInvoicePdfToCloudinary(invoice.id, session.user.id);
    } catch (error) {
      console.error("Cloudinary sync after create failed:", error);
    }

    return NextResponse.json(
      {
        success: true,
        data: { id: invoice.id, invoiceNumber: invoice.invoiceNumber },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Create invoice failed:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create invoice" },
      { status: 500 },
    );
  }
}
