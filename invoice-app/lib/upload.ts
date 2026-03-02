export const ALLOWED_LOGO_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/svg+xml",
] as const;

export const MAX_LOGO_SIZE_BYTES =
  (Number(process.env.MAX_UPLOAD_SIZE_MB || 5) || 5) * 1024 * 1024;

export function isValidLogoType(type: string): boolean {
  return ALLOWED_LOGO_TYPES.includes(type as (typeof ALLOWED_LOGO_TYPES)[number]);
}

export function isValidLogoSize(size: number): boolean {
  return size <= MAX_LOGO_SIZE_BYTES;
}

export function getExtensionFromMimeType(mimeType: string): string {
  return mimeType.split("/")[1].replace("svg+xml", "svg");
}
