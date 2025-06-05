"use client";

import { Textarea } from "@/components/ui/textarea";
import { MessageCircleMoreIcon } from "lucide-react";

interface ProductObservationsProps {
  value: string;
  onChange: (value: string) => void;
  maxLength?: number;
}

const ProductObservations = ({
  value,
  onChange,
  maxLength = 140,
}: ProductObservationsProps) => {
  return (
    <div className="space-y-2 p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageCircleMoreIcon size={18} className="text-muted-foreground" />
          <p className="text-sm font-medium text-foreground">
            Alguma observação?
          </p>
        </div>
        <span className="text-xs text-muted-foreground">
          {`${value.length} / ${maxLength}`}
        </span>
      </div>
      <Textarea
        placeholder="Ex: tirar a cebola, maionese à parte etc..."
        value={value}
        onChange={(e) => {
          if (e.target.value.length <= maxLength) {
            onChange(e.target.value);
          }
        }}
        className="min-h-[80px] text-sm"
        maxLength={maxLength}
      />
    </div>
  );
};

export default ProductObservations;
