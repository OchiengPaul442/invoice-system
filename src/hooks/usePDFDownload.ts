"use client";

import { useState } from "react";

export function usePDFDownload(): {
  isDownloading: boolean;
  downloadPDF: (invoiceId: string, invoiceNumber: string) => Promise<void>;
} {
  const [isDownloading, setIsDownloading] = useState(false);

  const downloadPDF = async (
    invoiceId: string,
    invoiceNumber: string,
  ): Promise<void> => {
    setIsDownloading(true);
    try {
      const params = new URLSearchParams({
        download: "0",
        filename: invoiceNumber,
      });
      const response = await fetch(`/api/pdf/${invoiceId}?${params.toString()}`, {
        cache: "no-store",
        headers: { Accept: "application/pdf" },
      });
      if (!response.ok) {
        throw new Error(`PDF request failed (${response.status})`);
      }

      const contentType = response.headers.get("content-type") || "";
      const isPdfResponse =
        contentType.includes("application/pdf") ||
        contentType.includes("application/octet-stream");

      if (!isPdfResponse) {
        throw new Error("Unexpected file response");
      }

      const blob = await response.blob();
      if (!blob.size) {
        throw new Error("Empty PDF response");
      }

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${invoiceNumber}.pdf`;
      link.rel = "noopener";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("PDF download error:", error);
      throw new Error("Unable to start PDF download");
    } finally {
      setIsDownloading(false);
    }
  };

  return { downloadPDF, isDownloading };
}
