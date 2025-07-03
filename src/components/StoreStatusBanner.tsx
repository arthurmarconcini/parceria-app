"use client";

import { useStoreStatus } from "@/hooks/use-store-status";
import { Info } from "lucide-react";

export function StoreStatusBanner() {
  const { isOpen, message, isLoading } = useStoreStatus();

  if (isLoading || isOpen) {
    return null;
  }

  return (
    <div className="bg-destructive/10 text-destructive text-center p-2 text-sm font-medium flex items-center justify-center gap-2">
      <Info className="h-4 w-4" />
      {message}
    </div>
  );
}
