import {
  Pizza,
  Utensils,
  Sandwich,
  GlassWater,
  HelpCircle,
  type LucideProps,
} from "lucide-react";
import type { ForwardRefExoticComponent, RefAttributes } from "react";

export type IconComponentType = ForwardRefExoticComponent<
  Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>
>;

export const categoryIconComponentMap: Record<string, IconComponentType> = {
  Pizzas: Pizza,
  Hambúrgueres: Sandwich,
  Bebidas: GlassWater,

  default: Utensils,
};

export const getIconComponentForCategory = (
  categoryName: string
): IconComponentType => {
  if (categoryIconComponentMap.hasOwnProperty(categoryName)) {
    return categoryIconComponentMap[categoryName];
  }
  console.warn(
    `[CategoryIcons] Nenhum ícone mapeado para a categoria "${categoryName}". Usando ícone padrão (Utensils ou HelpCircle se Utensils falhar).`
  );
  return categoryIconComponentMap.default || HelpCircle;
};
