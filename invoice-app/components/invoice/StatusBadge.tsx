import { cn, getStatusColor } from "@/lib/utils";

export function StatusBadge({ status }: { status: string }): JSX.Element {
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2 py-0.5 text-xs font-medium",
        getStatusColor(status),
      )}
    >
      {status}
    </span>
  );
}
