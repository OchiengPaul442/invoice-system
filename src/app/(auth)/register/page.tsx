"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getProviders, signIn } from "next-auth/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { AuthSplitShell } from "@/components/auth/AuthSplitShell";
import { SocialAuthButtons } from "@/components/auth/SocialAuthButtons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { registerSchema } from "@/schemas/settings.schema";

type RegisterValues = z.infer<typeof registerSchema>;

export default function RegisterPage(): JSX.Element {
  const router = useRouter();
  const [oauthLoading, setOauthLoading] = useState<"google" | "github" | null>(null);
  const [availableProviders, setAvailableProviders] = useState({ google: false, github: false });
  const [callbackUrl, setCallbackUrl] = useState("/settings");
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (values: RegisterValues): Promise<void> => {
    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const contentType = response.headers.get("content-type") ?? "";
      const payload = contentType.includes("application/json")
        ? ((await response.json()) as { success: boolean; error?: string })
        : { success: false, error: "Unexpected server response." };

      if (!response.ok || !payload.success) {
        toast({
          variant: "destructive",
          title: "Registration failed",
          description: payload.error ?? "Unable to create account.",
        });
        return;
      }

      const signInResult = await signIn("credentials", {
        email: values.email,
        password: values.password,
        remember: "true",
        redirect: false,
        callbackUrl,
      });

      if (signInResult?.error) {
        toast({
          variant: "destructive",
          title: "Login failed",
          description: "Account created, but auto-login failed. Please login manually.",
        });
        router.push("/login");
        return;
      }

      router.push(callbackUrl);
      router.refresh();
    } catch (error) {
      console.error("Register request failed:", error);
      toast({
        variant: "destructive",
        title: "Request failed",
        description: "Please try again.",
      });
    }
  };

  const continueWithProvider = async (provider: "google" | "github"): Promise<void> => {
    if (!availableProviders[provider]) {
      toast({
        variant: "destructive",
        title: `${provider === "google" ? "Google" : "GitHub"} sign-in unavailable`,
        description: "Please use email/password for now.",
      });
      return;
    }
    setOauthLoading(provider);
    await signIn(provider, { callbackUrl });
  };

  useEffect(() => {
    const callbackUrlParam = new URLSearchParams(window.location.search).get("callbackUrl");
    if (callbackUrlParam && callbackUrlParam.startsWith("/")) {
      setCallbackUrl(callbackUrlParam);
    }

    const loadProviders = async (): Promise<void> => {
      const providers = await getProviders();
      setAvailableProviders({
        google: Boolean(providers?.google),
        github: Boolean(providers?.github),
      });
    };
    void loadProviders();
  }, []);

  return (
    <AuthSplitShell
      subtitle="Create your workspace and start sending polished invoices that clients can trust."
      title="Launch Your Billing Workspace"
    >
      <div className="mx-auto w-full max-w-[520px]">
        <div className="mb-8 flex items-center justify-center gap-3 lg:justify-start">
          <p className="text-xl font-semibold text-ink">LedgerBloom</p>
        </div>
        <div className="w-full border border-surface-border bg-white/90 p-6 shadow-sm dark:bg-slate-950/80 sm:p-8">
          <div className="mb-7">
            <div className="mb-4 flex items-center gap-3">
              <Image
                alt="LedgerBloom logo"
                className="rounded-xl"
                height={40}
                priority
                src="/LOGO.png"
                width={40}
              />
              <p className="text-xs font-medium uppercase tracking-[0.16em] text-ink-muted">LedgerBloom</p>
            </div>
            <h1 className="text-[2.1rem] font-semibold leading-none text-slate-900 dark:text-slate-100">
              Create Account
            </h1>
            <p className="mt-3 text-sm text-ink-muted">
              Set up your profile and start billing clients professionally.
            </p>
          </div>
          <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" {...register("name")} />
              {errors.name ? <p className="text-xs text-red-600">{errors.name.message}</p> : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" {...register("email")} />
              {errors.email ? <p className="text-xs text-red-600">{errors.email.message}</p> : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" {...register("password")} />
              <p className="text-xs text-ink-muted">
                Use at least 12 characters with uppercase, lowercase, number, and special character.
              </p>
              {errors.password ? (
                <p className="text-xs text-red-600">{errors.password.message}</p>
              ) : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input id="confirmPassword" type="password" {...register("confirmPassword")} />
              {errors.confirmPassword ? (
                <p className="text-xs text-red-600">{errors.confirmPassword.message}</p>
              ) : null}
            </div>
            <Button className="h-11 w-full rounded-md bg-brand-600 text-white hover:bg-brand-700 dark:bg-brand-500 dark:text-white dark:hover:bg-brand-600" disabled={isSubmitting || oauthLoading !== null} type="submit">
              {isSubmitting ? "Creating account..." : "Create account"}
            </Button>
          </form>
          <div className="my-4 h-px bg-surface-border" />
          <SocialAuthButtons
            githubAvailable={availableProviders.github}
            googleAvailable={availableProviders.google}
            isLoading={oauthLoading}
            onGithub={() => void continueWithProvider("github")}
            onGoogle={() => void continueWithProvider("google")}
          />
          <p className="mt-6 text-center text-sm text-ink-muted">
            Already have an account?{" "}
            <Link className="font-semibold text-slate-900 hover:underline dark:text-slate-100" href="/login">
              Sign in
            </Link>
          </p>
          <p className="mt-4 text-center text-xs text-ink-muted">
            By creating an account, you agree to our{" "}
            <Link className="text-brand-700 hover:underline" href="/terms">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link className="text-brand-700 hover:underline" href="/privacy">
              Privacy Policy
            </Link>
            .
          </p>
        </div>
      </div>
    </AuthSplitShell>
  );
}
