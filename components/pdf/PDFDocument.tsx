import React from "react";
import { Document } from "@react-pdf/renderer";
import { ClassicTemplate } from "@/components/pdf/templates/ClassicTemplate";
import { MilestoneTemplate } from "@/components/pdf/templates/MilestoneTemplate";
import { MinimalTemplate } from "@/components/pdf/templates/MinimalTemplate";
import { ModernTemplate } from "@/components/pdf/templates/ModernTemplate";
import { RetainerTemplate } from "@/components/pdf/templates/RetainerTemplate";
import { PDFInvoice, PDFProfile } from "@/components/pdf/shared/types";

interface PDFDocumentProps {
  invoice: PDFInvoice;
  profile: PDFProfile | null;
}

const templateMap = {
  CLASSIC: ClassicTemplate,
  MODERN: ModernTemplate,
  MINIMAL: MinimalTemplate,
  MILESTONE: MilestoneTemplate,
  RETAINER: RetainerTemplate,
} as const;

export function PDFDocument({ invoice, profile }: PDFDocumentProps): JSX.Element {
  const Template =
    templateMap[invoice.templateType as keyof typeof templateMap] || ClassicTemplate;

  return (
    <Document>
      <Template invoice={invoice} profile={profile} />
    </Document>
  );
}
