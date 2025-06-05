// src/app/pedidos/_components/OrderFilters.tsx

"use client";

import { Input } from "@/components/ui/input";

export interface FiltersState {
  search: string;
  date: Date | null;
}

interface OrderFiltersProps {
  filters: FiltersState;
  onFilterChange: (filters: FiltersState) => void;
}

export const OrderFilters = ({
  filters,
  onFilterChange,
}: OrderFiltersProps) => {
  return (
    <div className="flex flex-col gap-4 md:flex-row">
      <Input
        placeholder="Pesquisar por nome do produto..."
        value={filters.search}
        onChange={(e) => onFilterChange({ ...filters, search: e.target.value })}
        className="w-full md:flex-1"
      />
      <Input
        type="date"
        value={filters.date ? filters.date.toISOString().split("T")[0] : ""}
        onChange={(e) =>
          onFilterChange({
            ...filters,
            date: e.target.value
              ? new Date(e.target.value + "T00:00:00")
              : null,
          })
        }
        className="w-full md:w-auto"
      />
    </div>
  );
};
