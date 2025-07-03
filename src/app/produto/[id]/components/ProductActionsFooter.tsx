"use client";

import { Button } from "@/components/ui/button";
import currencyFormat from "@/helpers/currency-format";
import { useStoreStatus } from "@/hooks/use-store-status";
import { Loader2, MinusIcon, PlusIcon, ShoppingCartIcon } from "lucide-react";

interface ProductActionsFooterProps {
  quantity: number;
  onDecrementQuantity: () => void;
  onIncrementQuantity: () => void;
  totalPrice: number;
  onAddToCart: () => void;
  disabledAddToCart?: boolean;
}

const ProductActionsFooter = ({
  quantity,
  onDecrementQuantity,
  onIncrementQuantity,
  totalPrice,
  onAddToCart,
  disabledAddToCart = false,
}: ProductActionsFooterProps) => {
  const { isOpen, isLoading } = useStoreStatus();

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card p-3 shadow-lg md:p-4">
      <div className="container mx-auto flex items-center gap-3 md:gap-4">
        <div className="flex items-center gap-1 rounded-md border p-1">
          <Button
            onClick={onDecrementQuantity}
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-primary hover:bg-primary/10 md:h-8 md:w-8"
            aria-label="Diminuir quantidade"
          >
            <MinusIcon size={16} strokeWidth={2.5} />
          </Button>
          <span className="w-6 text-center text-sm font-medium md:text-base">
            {quantity}
          </span>
          <Button
            onClick={onIncrementQuantity}
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-primary hover:bg-primary/10 md:h-8 md:w-8"
            aria-label="Aumentar quantidade"
          >
            <PlusIcon size={16} strokeWidth={2.5} />
          </Button>
        </div>
        <Button
          onClick={onAddToCart}
          className="h-10 flex-1 text-sm md:h-12 md:text-base"
          disabled={disabledAddToCart || !isOpen || isLoading}
        >
          <ShoppingCartIcon size={18} className="mr-2" />
          {isLoading ? (
            <Loader2 className="animate-spin" />
          ) : !isOpen ? (
            "Loja Fechada"
          ) : (
            `Adicionar (${currencyFormat(totalPrice)})`
          )}
        </Button>
      </div>
    </div>
  );
};

export default ProductActionsFooter;
