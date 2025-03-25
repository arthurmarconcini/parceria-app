import { Trash2Icon, MinusIcon, PlusIcon } from "lucide-react";
import { Button } from "../../ui/button";
import { CartItem, useCartStore } from "@/app/_hooks/cartStore";

interface QuantityButtonProps {
  product: CartItem;
}

const QuantityButton = ({ product }: QuantityButtonProps) => {
  const { decreaseQuantity, increaseQuantity, removeFromCart } = useCartStore();

  return (
    <div className="rounded-md flex gap-2 items-center bg-neutral-100 ">
      {product.quantity === 1 ? (
        <Button
          onClick={() => removeFromCart(product.cartItemId)}
          size="icon"
          variant="ghost"
          className="text-destructive"
        >
          <Trash2Icon size={18} />
        </Button>
      ) : (
        <Button
          onClick={() => decreaseQuantity(product.cartItemId)}
          size="icon"
          variant="ghost"
          className="text-chart-5"
        >
          <MinusIcon size={18} strokeWidth={1.5} />
        </Button>
      )}
      <div className="text-sm w-3 text-center">{product.quantity}</div>

      <Button
        onClick={() => increaseQuantity(product.cartItemId)}
        size="icon"
        variant="ghost"
        className="text-chart-5 "
      >
        <PlusIcon size={18} strokeWidth={1.5} />
      </Button>
    </div>
  );
};

export default QuantityButton;
