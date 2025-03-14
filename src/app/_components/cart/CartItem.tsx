import Image from "next/image";
import type { CartItem } from "../../_hooks/cartStore";
import currencyFormat from "../../_helpers/currency-format";
import QuantityButton from "./_components/quantityButton";

interface CartItemProps {
  item: CartItem;
}

const CartItem = ({ item }: CartItemProps) => {
  const extrasTotal = item.orderExtras.reduce((total, extra) => {
    return total + extra.priceAtTime * extra.quantity;
  }, 0);
  const itemTotal = (item.priceAtTime + extrasTotal) * item.quantity;

  return (
    <div className="flex justify-between items-center gap-4">
      <div className="flex gap-2">
        <Image
          src={item.imageUrl}
          alt={item.name}
          width={48}
          height={48}
          className="rounded-md"
        />

        <div>
          <h1 className="font-bold text-sm">{item.name}</h1>
          <span className="text-xs text-muted-foreground">
            {currencyFormat(itemTotal)}
          </span>
        </div>
      </div>
      <div>
        <QuantityButton product={item} />
      </div>
    </div>
  );
};

export default CartItem;
