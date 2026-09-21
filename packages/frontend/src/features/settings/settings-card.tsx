import type * as React from "react";
import { cn } from "@/lib/utils";

type SettingsCardProps = React.ComponentProps<"div">;

export default function SettingsCard({
  className,
  children,
}: SettingsCardProps) {
  return (
    <div
      className={cn(
        "flex w-full max-w-160 flex-col gap-4 rounded-xl border border-border/50 bg-view-2/95 p-5 shadow-sm top-highlight",
        className,
      )}
    >
      {children}
    </div>
  );
}
