// lib/categoryIconMap.ts
import dynamicIconImports from "lucide-react/dynamicIconImports";

export type LucideIconName = keyof typeof dynamicIconImports;

export const categoryIconMap: Record<string, LucideIconName> = {
  Pizza: "pizza",

  default: "utensils",
};
