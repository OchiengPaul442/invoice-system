"use client";

import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface BackButtonProps {
  href?: string;
  label?: string;
  className?: string;
}

export function BackButton({
  href = "/",
  label = "Back",
  className,
}: BackButtonProps): JSX.Element {
  const router = useRouter();

  const goBack = (): void => {
    if (window.history.length > 1) {
      router.back();
      return;
    }
    router.push(href);
  };

  return (
    <Button
      className={cn("w-fit", className)}
      onClick={goBack}
      size="sm"
      type="button"
      variant="outline"
    >
      <ArrowLeft className="h-4 w-4" />
      {label}
    </Button>
  );
}
