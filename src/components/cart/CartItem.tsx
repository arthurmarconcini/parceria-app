import Image from "next/image";
import type { CartItem } from "../../hooks/cartStore";
import currencyFormat from "../../helpers/currency-format";
import QuantityButton from "./components/quantityButton";

interface CartItemProps {
  item: CartItem;
}

const CartItem = ({ item }: CartItemProps) => {
  const extrasTotal = item.orderExtras.reduce((total, extra) => {
    return total + extra.priceAtTime * extra.quantity;
  }, 0);
  const itemTotal = (item.priceAtTime + extrasTotal) * item.quantity;

  return (
    <div className="py-2 flex justify-between items-start gap-2 w-full bg-white rounded-lg min-h-[70px]">
      <div className="flex gap-2 items-start w-[70%]">
        <div className="relative h-[60px] w-[60px] flex-shrink-0">
          <Image
            src={
              item.imageUrl ||
              "https://img.freepik.com/fotos-gratis/um-copo-de-suco-de-laranja-e-frutas-frescas-no-chao-com-cubos-de-gelo_1150-23627.jpg"
            }
            alt={item.name}
            fill
            className="rounded-md object-cover"
            sizes="(max-width: 60px) 100vw"
          />
        </div>

        <div className="flex flex-col gap-2">
          <div>
            <h1 className="font-semibold text-xs line-clamp-2">{item.name}</h1>
            <h2 className="text-xs text-muted-foreground line-clamp-1">{}</h2>
          </div>

          <span className="text-xs text-orange-400 font-semibold">
            {currencyFormat(itemTotal)}
          </span>

          <div>
            {item.orderExtras.map((extra) => (
              <div key={extra.name} className="flex gap-2 items-center">
                <div className="text-xs bg-orange-400 text-white font-semibold px-2 py-0.5 rounded-full flex items-center justify-center min-w-[20px] h-5">
                  {extra.quantity}
                </div>
                <span className="text-xs text-muted-foreground">
                  {extra.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div>
        <QuantityButton product={item} />
      </div>
    </div>
  );
};

export default CartItem;
