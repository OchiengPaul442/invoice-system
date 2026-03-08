"use client";

import { signIn } from "next-auth/react";
import { useEffect, useState } from "react";
import { Github } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { formatDate } from "@/lib/utils";

type ProviderKey = "google" | "github";

interface ProviderState {
  available: boolean;
  linked: boolean;
  linkedEmail: string | null;
  linkedAt: string | null;
}

interface ConnectionsResponse {
  success: boolean;
  data?: {
    providers: Record<ProviderKey, ProviderState>;
  };
  error?: string;
}

function GoogleIcon(): JSX.Element {
  return (
    <svg aria-hidden="true" className="h-4 w-4" viewBox="0 0 24 24">
      <path
        d="M21.6 12.23c0-.67-.06-1.31-.18-1.93H12v3.64h5.39a4.61 4.61 0 0 1-2 3.03v2.5h3.24c1.9-1.75 2.97-4.33 2.97-7.24Z"
        fill="#4285F4"
      />
      <path
        d="M12 22c2.7 0 4.97-.9 6.63-2.53l-3.24-2.5c-.9.6-2.05.95-3.39.95-2.61 0-4.82-1.76-5.61-4.13H3.04v2.58A10 10 0 0 0 12 22Z"
        fill="#34A853"
      />
      <path
        d="M6.39 13.79a6.01 6.01 0 0 1 0-3.58V7.63H3.04a10 10 0 0 0 0 8.74l3.35-2.58Z"
        fill="#FBBC05"
      />
      <path
        d="M12 6.08c1.47 0 2.79.5 3.83 1.5l2.87-2.87C16.96 3.08 14.7 2 12 2A10 10 0 0 0 3.04 7.63l3.35 2.58c.79-2.37 3-4.13 5.61-4.13Z"
        fill="#EA4335"
      />
    </svg>
  );
}

const providerMeta: Record<ProviderKey, { title: string; blurb: string; icon: JSX.Element }> = {
  google: {
    title: "Google",
    blurb: "Use your Google workspace account for fast and secure sign-in.",
    icon: <GoogleIcon />,
  },
  github: {
    title: "GitHub",
    blurb: "Use your GitHub identity for developer-friendly account access.",
    icon: <Github className="h-4 w-4" />,
  },
};

export function ConnectedAccounts(): JSX.Element {
  const [providers, setProviders] = useState<Record<ProviderKey, ProviderState>>({
    google: { available: false, linked: false, linkedEmail: null, linkedAt: null },
    github: { available: false, linked: false, linkedEmail: null, linkedAt: null },
  });
  const [isLoading, setIsLoading] = useState(true);
  const [busyProvider, setBusyProvider] = useState<ProviderKey | null>(null);

  const loadConnections = async (): Promise<void> => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/settings/connections", { cache: "no-store" });
      const payload = (await response.json()) as ConnectionsResponse;
      if (!response.ok || !payload.success || !payload.data) {
        throw new Error(payload.error || "Failed to load auth providers");
      }
      setProviders(payload.data.providers);
    } catch (error) {
      console.error("Load connections failed:", error);
      toast({
        variant: "destructive",
        title: "Unable to load linked accounts",
        description: error instanceof Error ? error.message : "Try again shortly.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadConnections();
  }, []);

  const connectProvider = async (provider: ProviderKey): Promise<void> => {
    if (!providers[provider].available) {
      toast({
        variant: "destructive",
        title: `${providerMeta[provider].title} not configured`,
        description: "Add provider credentials in environment settings first.",
      });
      return;
    }

    setBusyProvider(provider);
    await signIn(provider, {
      callbackUrl: "/settings?tab=accounts",
    });
  };

  const unlinkProvider = async (provider: ProviderKey): Promise<void> => {
    setBusyProvider(provider);
    try {
      const response = await fetch("/api/settings/connections", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider }),
      });
      const payload = (await response.json()) as { success: boolean; error?: string };
      if (!response.ok || !payload.success) {
        throw new Error(payload.error || "Failed to unlink provider");
      }
      toast({ title: `${providerMeta[provider].title} unlinked` });
      await loadConnections();
    } catch (error) {
      console.error("Unlink provider failed:", error);
      toast({
        variant: "destructive",
        title: "Unlink failed",
        description: error instanceof Error ? error.message : "Unable to unlink provider.",
      });
    } finally {
      setBusyProvider(null);
    }
  };

  return (
    <div className="space-y-3">
      <div className="rounded-xl border border-surface-border bg-surface-muted/60 p-3 text-sm text-ink-muted">
        Link Google or GitHub using the same email as your LedgerBloom account for safer identity matching.
      </div>
      {(["google", "github"] as ProviderKey[]).map((provider) => {
        const state = providers[provider];
        const meta = providerMeta[provider];
        return (
          <div
            key={provider}
            className="rounded-xl border border-surface-border bg-card px-4 py-3 shadow-sm"
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="flex items-center gap-2 text-sm font-semibold text-ink">
                  {meta.icon}
                  {meta.title}
                </p>
                <p className="mt-1 text-xs text-ink-muted">{meta.blurb}</p>
                {state.linked ? (
                  <p className="mt-2 text-xs text-ink-muted">
                    Linked as {state.linkedEmail || "unknown"}{" "}
                    {state.linkedAt ? `on ${formatDate(state.linkedAt)}` : ""}
                  </p>
                ) : (
                  <p className="mt-2 text-xs text-ink-muted">Not linked yet.</p>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  className="rounded-lg"
                  disabled={isLoading || busyProvider !== null}
                  onClick={() => void connectProvider(provider)}
                  type="button"
                  variant={state.linked ? "outline" : "default"}
                >
                  {busyProvider === provider ? "Please wait..." : state.linked ? "Reconnect" : "Connect"}
                </Button>
                {state.linked ? (
                  <Button
                    className="rounded-lg"
                    disabled={busyProvider !== null}
                    onClick={() => void unlinkProvider(provider)}
                    type="button"
                    variant="outline"
                  >
                    Unlink
                  </Button>
                ) : null}
              </div>
            </div>
            {!state.available ? (
              <p className="mt-2 text-xs text-amber-600 dark:text-amber-400">
                Provider credentials are not configured yet.
              </p>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}

