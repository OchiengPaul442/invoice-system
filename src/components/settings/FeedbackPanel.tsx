"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import useSWR from "swr";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { jsonFetcher } from "@/lib/fetcher";
import { formatDate } from "@/lib/utils";
import { feedbackSchema } from "@/schemas/feedback.schema";

type FeedbackValues = z.infer<typeof feedbackSchema>;

interface FeedbackListItem {
  id: string;
  category: string;
  subject: string;
  status: string;
  createdAt: string;
}

export function FeedbackPanel({ accountEmail }: { accountEmail?: string }): JSX.Element {
  const {
    register,
    setValue,
    watch,
    reset,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FeedbackValues>({
    resolver: zodResolver(feedbackSchema),
    defaultValues: {
      category: "issue",
      subject: "",
      message: "",
      contactEmail: accountEmail || "",
    },
  });
  const { data, isLoading: isHistoryLoading, mutate } = useSWR<{ success: boolean; data?: FeedbackListItem[] }>(
    "/api/feedback",
    jsonFetcher,
    { revalidateOnFocus: true },
  );
  const history = data?.data || [];

  const category = watch("category");

  const onSubmit = async (values: FeedbackValues): Promise<void> => {
    try {
      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const payload = (await response.json()) as { success: boolean; error?: string };
      if (!response.ok || !payload.success) {
        throw new Error(payload.error || "Failed to submit feedback");
      }
      toast({
        title: "Feedback submitted",
        description: "Thanks for helping improve LedgerBloom.",
      });
      reset({
        category: "issue",
        subject: "",
        message: "",
        contactEmail: values.contactEmail || accountEmail || "",
      });
      await mutate();
    } catch (error) {
      console.error("Submit feedback failed:", error);
      toast({
        variant: "destructive",
        title: "Submission failed",
        description: error instanceof Error ? error.message : "Could not submit feedback",
      });
    }
  };

  return (
    <div className="grid gap-5 xl:grid-cols-[1.35fr_1fr]">
      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <div className="grid gap-3 md:grid-cols-2">
          <div className="space-y-1">
            <Label>Category</Label>
            <Select value={category} onValueChange={(value) => setValue("category", value as FeedbackValues["category"], { shouldValidate: true })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="issue">Issue</SelectItem>
                <SelectItem value="enhancement">Enhancement</SelectItem>
                <SelectItem value="general">General</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label>Contact Email (optional)</Label>
            <Input placeholder="name@example.com" {...register("contactEmail")} />
            {errors.contactEmail ? <p className="text-xs text-red-600">{errors.contactEmail.message}</p> : null}
          </div>
        </div>
        <div className="space-y-1">
          <Label>Subject</Label>
          <Input placeholder="PDF download issue on mobile" {...register("subject")} />
          {errors.subject ? <p className="text-xs text-red-600">{errors.subject.message}</p> : null}
        </div>
        <div className="space-y-1">
          <Label>Details</Label>
          <Textarea
            className="min-h-[170px]"
            placeholder="Tell us what happened, steps to reproduce, and what you expected."
            {...register("message")}
          />
          {errors.message ? <p className="text-xs text-red-600">{errors.message.message}</p> : null}
        </div>
        <Button className="rounded-lg" disabled={isSubmitting} type="submit">
          {isSubmitting ? "Sending..." : "Send Feedback"}
        </Button>
      </form>

      <div className="rounded-xl border border-surface-border bg-surface-muted/40 p-4">
        <p className="text-sm font-semibold text-ink">Recent Feedback</p>
        {isHistoryLoading ? (
          <p className="mt-2 text-sm text-ink-muted">Loading...</p>
        ) : !history.length ? (
          <p className="mt-2 text-sm text-ink-muted">No feedback submitted yet.</p>
        ) : (
          <ul className="mt-3 space-y-2">
            {history.map((item) => (
              <li key={item.id} className="rounded-lg border border-surface-border bg-card px-3 py-2 text-sm">
                <p className="font-medium text-ink">{item.subject}</p>
                <p className="text-xs text-ink-muted">
                  {item.category} - {item.status} - {formatDate(item.createdAt)}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
