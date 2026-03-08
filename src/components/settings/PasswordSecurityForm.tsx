"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";

interface PasswordSecurityFormProps {
  hasPassword: boolean;
  oauthProviders: string[];
  onSaved?: () => void;
}

interface PasswordResponse {
  success: boolean;
  error?: string;
}

export function PasswordSecurityForm({
  hasPassword,
  oauthProviders,
  onSaved,
}: PasswordSecurityFormProps): JSX.Element {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const providerLabel = useMemo(() => {
    if (!oauthProviders.length) return "social provider";
    return oauthProviders
      .map((provider) => (provider === "google" ? "Google" : "GitHub"))
      .join(" and ");
  }, [oauthProviders]);

  const submit = async (): Promise<void> => {
    setIsSaving(true);
    try {
      const response = await fetch("/api/settings/password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: hasPassword ? currentPassword : undefined,
          newPassword,
          confirmPassword,
        }),
      });

      const payload = (await response.json()) as PasswordResponse;
      if (!response.ok || !payload.success) {
        throw new Error(payload.error || "Failed to update password");
      }

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");

      toast({
        title: hasPassword ? "Password updated" : "Password created",
        description: hasPassword
          ? "Your password has been updated successfully."
          : "You can now sign in with email and password.",
      });
      onSaved?.();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Password update failed",
        description: error instanceof Error ? error.message : "Please try again.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-surface-border bg-surface-muted/60 p-3 text-sm text-ink-muted">
        {hasPassword ? (
          <p>Use a strong password and rotate it periodically for better account protection.</p>
        ) : (
          <p>
            Your account currently uses {providerLabel} sign-in only. Create a password to enable
            credentials login as a backup access method.
          </p>
        )}
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {hasPassword ? (
          <div className="space-y-1 md:col-span-2">
            <Label htmlFor="currentPassword">Current Password</Label>
            <Input
              id="currentPassword"
              type="password"
              value={currentPassword}
              onChange={(event) => setCurrentPassword(event.target.value)}
            />
          </div>
        ) : null}

        <div className="space-y-1">
          <Label htmlFor="newPassword">{hasPassword ? "New Password" : "Create Password"}</Label>
          <Input
            id="newPassword"
            type="password"
            value={newPassword}
            onChange={(event) => setNewPassword(event.target.value)}
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="confirmPassword">Confirm Password</Label>
          <Input
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
          />
        </div>
      </div>

      <p className="text-xs text-ink-muted">
        Password must be 12+ characters and include uppercase, lowercase, number, and special
        character.
      </p>

      <Button className="rounded-xl" disabled={isSaving} onClick={() => void submit()} type="button">
        {isSaving
          ? hasPassword
            ? "Updating..."
            : "Creating..."
          : hasPassword
            ? "Update Password"
            : "Create Password"}
      </Button>
    </div>
  );
}
