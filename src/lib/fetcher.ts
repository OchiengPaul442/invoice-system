export async function jsonFetcher<T>(url: string): Promise<T> {
  const response = await fetch(url, { cache: "no-store" });
  const payload = (await response.json()) as T & { error?: string; success?: boolean };
  if (!response.ok || payload.success === false) {
    throw new Error(payload?.error || `Request failed: ${response.status}`);
  }
  return payload;
}
