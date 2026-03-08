"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { registerSchema } from "@/schemas/settings.schema";

type RegisterValues = z.infer<typeof registerSchema>;

export default function RegisterPage(): JSX.Element {
  const router = useRouter();
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
        redirect: false,
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

      router.push("/settings");
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

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-brand-50 via-white to-[#fff7eb] px-4 py-8 dark:from-slate-950 dark:via-slate-950 dark:to-slate-900">
      <Card className="w-full max-w-md rounded-2xl border-surface-border shadow-md">
        <CardHeader>
          <div className="mb-4 flex items-center gap-3">
            <Image
              src="/LOGO.png"
              alt="LedgerBloom logo"
              width={44}
              height={44}
              className="rounded-xl"
              priority
            />
            <p className="text-sm font-medium uppercase tracking-[0.12em] text-ink-muted">LedgerBloom</p>
          </div>
          <CardTitle className="text-2xl font-semibold text-ink">
            Create your LedgerBloom account
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" {...register("name")} />
              {errors.name && (
                <p className="text-xs text-red-600">{errors.name.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" {...register("email")} />
              {errors.email && (
                <p className="text-xs text-red-600">{errors.email.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" {...register("password")} />
              {errors.password && (
                <p className="text-xs text-red-600">{errors.password.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                {...register("confirmPassword")}
              />
              {errors.confirmPassword && (
                <p className="text-xs text-red-600">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>
            <div className="text-xs text-ink-muted">
              Already have an account?{" "}
              <Link className="text-brand-600 hover:underline" href="/login">
                Sign in
              </Link>
            </div>
            <Button className="w-full rounded-xl" disabled={isSubmitting} type="submit">
              {isSubmitting ? "Creating account..." : "Create account"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
