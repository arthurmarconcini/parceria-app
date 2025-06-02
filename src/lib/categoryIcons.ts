import dynamicIconImports from "lucide-react/dynamicIconImports";

export type LucideIconName = keyof typeof dynamicIconImports;

export const categoryIconMap: Record<string, LucideIconName> = {
  Pizzas: "pizza",
  Hambúrgueres: "sandwich",
  Bebidas: "glass-water",

  default: "utensils", // Fallback icon
};
