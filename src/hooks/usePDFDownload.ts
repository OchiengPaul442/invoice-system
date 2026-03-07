"use client";

export function usePDFDownload(): {
  downloadPDF: (invoiceId: string, invoiceNumber: string) => Promise<void>;
} {
  const downloadPDF = async (
    invoiceId: string,
    invoiceNumber: string,
  ): Promise<void> => {
    try {
      const response = await fetch(`/api/pdf/${invoiceId}`);
      if (!response.ok) {
        throw new Error("PDF generation failed");
      }

      const contentType = response.headers.get("content-type") || "";
      if (!contentType.includes("application/pdf")) {
        const errorBody = await response.text();
        throw new Error(errorBody || "Unexpected file response");
      }

      const blob = await response.blob();
      if (!blob.size) {
        throw new Error("Generated PDF is empty");
      }

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${invoiceNumber}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("PDF download error:", error);
      throw error;
    }
  };

  return { downloadPDF };
}
