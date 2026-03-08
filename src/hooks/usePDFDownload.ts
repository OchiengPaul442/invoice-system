"use client";

import { useState } from "react";

interface Base64PdfResponse {
  success: boolean;
  data?: {
    fileName: string;
    contentType: string;
    base64: string;
  };
  error?: string;
}

function saveBlob(blob: Blob, invoiceNumber: string): void {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${invoiceNumber}.pdf`;
  link.rel = "noopener";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}

function decodeBase64Pdf(base64: string, contentType: string): Blob {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new Blob([bytes], { type: contentType || "application/pdf" });
}

export function usePDFDownload(): {
  isDownloading: boolean;
  isOpening: boolean;
  downloadPDF: (invoiceId: string, invoiceNumber: string) => Promise<void>;
  openPDFInBrowser: (
    invoiceId: string,
    invoiceNumber: string,
    cloudPdfUrl?: string | null,
  ) => Promise<void>;
} {
  const [isDownloading, setIsDownloading] = useState(false);
  const [isOpening, setIsOpening] = useState(false);

  const requestBase64Fallback = async (
    invoiceId: string,
    invoiceNumber: string,
    download: boolean,
  ): Promise<Blob> => {
    const fallbackResponse = await fetch(`/api/pdf/${invoiceId}`, {
      method: "POST",
      cache: "no-store",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        download,
        format: "base64",
        fileName: invoiceNumber,
      }),
    });

    const payload = (await fallbackResponse.json()) as Base64PdfResponse;
    if (!fallbackResponse.ok || !payload.success || !payload.data?.base64) {
      throw new Error(payload.error || "PDF fallback failed");
    }

    return decodeBase64Pdf(payload.data.base64, payload.data.contentType);
  };

  const downloadPDF = async (
    invoiceId: string,
    invoiceNumber: string,
  ): Promise<void> => {
    setIsDownloading(true);
    try {
      // Always use base64 transport for downloads to avoid browser/plugin interception.
      const fallbackBlob = await requestBase64Fallback(invoiceId, invoiceNumber, true);
      if (!fallbackBlob.size) {
        throw new Error("Empty PDF file");
      }
      saveBlob(fallbackBlob, invoiceNumber);
    } catch (error) {
      console.error("PDF download error:", error);
      throw new Error(error instanceof Error ? error.message : "Unable to start PDF download");
    } finally {
      setIsDownloading(false);
    }
  };

  const openPDFInBrowser = async (
    invoiceId: string,
    invoiceNumber: string,
    cloudPdfUrl?: string | null,
  ): Promise<void> => {
    setIsOpening(true);
    try {
      if (cloudPdfUrl) {
        window.open(cloudPdfUrl, "_blank", "noopener,noreferrer");
        return;
      }

      const response = await fetch(`/api/pdf/${invoiceId}`, {
        method: "POST",
        cache: "no-store",
        headers: { "Content-Type": "application/json", Accept: "application/pdf" },
        body: JSON.stringify({
          download: false,
          fileName: invoiceNumber,
        }),
      });

      let blob: Blob;
      if (response.ok && (response.headers.get("content-type") || "").includes("application/pdf")) {
        blob = await response.blob();
      } else if (response.status === 204 || response.ok) {
        blob = await requestBase64Fallback(invoiceId, invoiceNumber, false);
      } else {
        throw new Error(`Open PDF failed (${response.status})`);
      }

      const objectUrl = window.URL.createObjectURL(blob);
      window.open(objectUrl, "_blank", "noopener,noreferrer");
      window.setTimeout(() => {
        window.URL.revokeObjectURL(objectUrl);
      }, 30_000);
    } catch (error) {
      console.error("Open PDF failed:", error);
      if (cloudPdfUrl) {
        window.open(cloudPdfUrl, "_blank", "noopener,noreferrer");
      }
    } finally {
      setIsOpening(false);
    }
  };

  return { downloadPDF, isDownloading, isOpening, openPDFInBrowser };
}
