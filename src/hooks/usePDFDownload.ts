"use client";

import { useState } from "react";

export function usePDFDownload(): {
  isDownloading: boolean;
  downloadPDF: (invoiceId: string, invoiceNumber: string) => Promise<void>;
  openPDFInBrowser: (invoiceId: string, invoiceNumber: string) => void;
} {
  const [isDownloading, setIsDownloading] = useState(false);

  const downloadPDF = async (
    invoiceId: string,
    invoiceNumber: string,
  ): Promise<void> => {
    setIsDownloading(true);
    try {
      const response = await fetch(`/api/pdf/${invoiceId}`, {
        method: "POST",
        cache: "no-store",
        headers: { "Content-Type": "application/json", Accept: "application/pdf" },
        body: JSON.stringify({
          download: true,
          fileName: invoiceNumber,
        }),
      });

      if (response.status === 204) {
        // Some browser extensions intercept PDF requests. Fallback to browser-native download.
        const directUrl = `/api/pdf/${invoiceId}?download=1&filename=${encodeURIComponent(invoiceNumber)}`;
        const directLink = document.createElement("a");
        directLink.href = directUrl;
        directLink.rel = "noopener";
        document.body.appendChild(directLink);
        directLink.click();
        document.body.removeChild(directLink);
        return;
      }

      if (!response.ok) {
        let reason = `PDF request failed (${response.status})`;
        try {
          const text = await response.text();
          if (text) reason = text;
        } catch {
          // ignore parse failure
        }
        throw new Error(reason);
      }

      const contentType = response.headers.get("content-type") || "";
      if (!contentType.includes("application/pdf")) {
        const directUrl = `/api/pdf/${invoiceId}?download=1&filename=${encodeURIComponent(invoiceNumber)}`;
        const directLink = document.createElement("a");
        directLink.href = directUrl;
        directLink.rel = "noopener";
        document.body.appendChild(directLink);
        directLink.click();
        document.body.removeChild(directLink);
        return;
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

  const openPDFInBrowser = (invoiceId: string, invoiceNumber: string): void => {
    const params = new URLSearchParams({
      download: "0",
      filename: invoiceNumber,
    });
    window.open(`/api/pdf/${invoiceId}?${params.toString()}`, "_blank", "noopener,noreferrer");
  };

  return { downloadPDF, isDownloading, openPDFInBrowser };
}
