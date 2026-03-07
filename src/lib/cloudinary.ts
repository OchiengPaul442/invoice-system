import { createHash } from "crypto";

interface CloudinaryUploadResult {
  secure_url: string;
  public_id: string;
}

function getCloudinaryConfig(): {
  cloudName: string;
  apiKey: string;
  apiSecret: string;
  folder: string;
} | null {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  const folder = process.env.CLOUDINARY_FOLDER || "invoiceflow/invoices";

  if (!cloudName || !apiKey || !apiSecret) {
    return null;
  }

  return { cloudName, apiKey, apiSecret, folder };
}

function signCloudinaryParams(params: Record<string, string | number>, apiSecret: string): string {
  const payload = Object.entries(params)
    .filter(([, value]) => value !== undefined && value !== null && value !== "")
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}=${value}`)
    .join("&");

  return createHash("sha1")
    .update(`${payload}${apiSecret}`)
    .digest("hex");
}

export function isCloudinaryConfigured(): boolean {
  return Boolean(getCloudinaryConfig());
}

export async function uploadPdfToCloudinary({
  fileBuffer,
  fileName,
  publicId,
}: {
  fileBuffer: Buffer;
  fileName: string;
  publicId: string;
}): Promise<{ url: string; publicId: string } | null> {
  const config = getCloudinaryConfig();
  if (!config) return null;

  const timestamp = Math.floor(Date.now() / 1000);
  const paramsToSign = {
    folder: config.folder,
    public_id: publicId,
    timestamp,
    overwrite: "true",
    invalidate: "true",
  };

  const signature = signCloudinaryParams(paramsToSign, config.apiSecret);
  const formData = new FormData();
  const bytes = new Uint8Array(fileBuffer);
  const blob = new Blob([bytes], { type: "application/pdf" });

  formData.append("file", blob, fileName);
  formData.append("api_key", config.apiKey);
  formData.append("timestamp", String(timestamp));
  formData.append("signature", signature);
  formData.append("folder", config.folder);
  formData.append("public_id", publicId);
  formData.append("overwrite", "true");
  formData.append("invalidate", "true");

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${config.cloudName}/raw/upload`,
    {
      method: "POST",
      body: formData,
    },
  );

  const payload = (await response.json()) as CloudinaryUploadResult & { error?: { message?: string } };
  if (!response.ok) {
    throw new Error(payload.error?.message || "Cloudinary upload failed");
  }

  return {
    url: payload.secure_url,
    publicId: payload.public_id,
  };
}

export async function deleteCloudinaryAsset(publicId: string | null | undefined): Promise<void> {
  if (!publicId) return;

  const config = getCloudinaryConfig();
  if (!config) return;

  const timestamp = Math.floor(Date.now() / 1000);
  const paramsToSign = {
    public_id: publicId,
    timestamp,
    resource_type: "raw",
    type: "upload",
    invalidate: "true",
  };

  const signature = signCloudinaryParams(paramsToSign, config.apiSecret);
  const formData = new FormData();
  formData.append("public_id", publicId);
  formData.append("api_key", config.apiKey);
  formData.append("timestamp", String(timestamp));
  formData.append("signature", signature);
  formData.append("resource_type", "raw");
  formData.append("type", "upload");
  formData.append("invalidate", "true");

  await fetch(`https://api.cloudinary.com/v1_1/${config.cloudName}/raw/destroy`, {
    method: "POST",
    body: formData,
  });
}
