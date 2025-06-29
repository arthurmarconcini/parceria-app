// src/components/ui/NativeSelect.tsx
import * as React from "react";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";

const NativeSelect = React.forwardRef<
  HTMLSelectElement,
  React.SelectHTMLAttributes<HTMLSelectElement>
>(({ className, children, ...props }, ref) => {
  return (
    <div className="relative">
      <select
        className={cn(
          "h-9 w-full min-w-0 appearance-none rounded-md border border-input bg-transparent px-3 py-1 pr-8 text-base shadow-xs ring-offset-background transition-[color,box-shadow] placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      >
        {children}
      </select>
      <ChevronDown className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 opacity-50" />
    </div>
  );
});
NativeSelect.displayName = "NativeSelect";

export { NativeSelect };
