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
import { loginSchema } from "@/schemas/settings.schema";

type LoginValues = z.infer<typeof loginSchema>;

export default function LoginPage(): JSX.Element {
  const router = useRouter();
  const [oauthLoading, setOauthLoading] = useState<"google" | "github" | null>(null);
  const [availableProviders, setAvailableProviders] = useState({ google: false, github: false });
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      remember: false,
    },
  });

  const onSubmit = async (values: LoginValues): Promise<void> => {
    const result = await signIn("credentials", {
      email: values.email,
      password: values.password,
      remember: values.remember ? "true" : "false",
      redirect: false,
      callbackUrl: "/",
    });

    if (!result || result.error) {
      toast({
        variant: "destructive",
        title: "Login failed",
        description: "Invalid email or password.",
      });
      return;
    }

    router.push("/");
    router.refresh();
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
    await signIn(provider, { callbackUrl: "/" });
  };

  useEffect(() => {
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
      subtitle="You can get everything you want if you work hard, trust the process, and stick to the plan."
      title="Get Everything You Want"
    >
      <div className="w-full">
        <div className="mb-12 flex items-center justify-center gap-3 lg:justify-start">
          <p className="text-xl font-semibold text-ink">LedgerBloom</p>
        </div>
        <div className="rounded-xl border border-surface-border bg-white/90 p-6 shadow-sm dark:bg-slate-950/80 sm:p-8">
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
              Welcome Back
            </h1>
            <p className="mt-3 text-sm text-ink-muted">
              Enter your email and password to access your account.
            </p>
          </div>
          <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" {...register("email")} />
              {errors.email ? <p className="text-xs text-red-600">{errors.email.message}</p> : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" {...register("password")} />
              {errors.password ? (
                <p className="text-xs text-red-600">{errors.password.message}</p>
              ) : null}
            </div>
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-xs text-ink-muted">
                <input
                  className="h-4 w-4 rounded border-surface-border accent-brand-600"
                  type="checkbox"
                  {...register("remember")}
                />
                Remember me
              </label>
              <Link className="text-xs text-brand-700 hover:underline" href="/register">
                Create account
              </Link>
            </div>
            <Button className="h-11 w-full rounded-lg bg-slate-950 text-white hover:bg-slate-900 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200" disabled={isSubmitting || oauthLoading !== null} type="submit">
              {isSubmitting ? "Signing in..." : "Sign In"}
            </Button>
          </form>
          <div className="mt-4">
            <SocialAuthButtons
              githubAvailable={availableProviders.github}
              googleAvailable={availableProviders.google}
              isLoading={oauthLoading}
              onGithub={() => void continueWithProvider("github")}
              onGoogle={() => void continueWithProvider("google")}
            />
          </div>
          <p className="mt-6 text-center text-sm text-ink-muted">
            Don&apos;t have an account?{" "}
            <Link className="font-semibold text-slate-900 hover:underline dark:text-slate-100" href="/register">
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    </AuthSplitShell>
  );
}
