import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import currencyFormat from "@/helpers/currency-format";
import { CartItem } from "@/hooks/cartStore";

interface OrderSummaryProps {
  cart: CartItem[];
  totalPrice: number;
  deliveryFee: number;
  finalTotal: number;
}

export const OrderSummary = ({
  cart,
  totalPrice,
  deliveryFee,
  finalTotal,
}: OrderSummaryProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Resumo do Pedido</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {cart.map((item) => (
          <div key={item.cartItemId} className="flex justify-between text-sm">
            <span className="text-muted-foreground">
              {item.quantity}x {item.name}
            </span>
            <span>{currencyFormat(item.priceAtTime * item.quantity)}</span>
          </div>
        ))}
        <div className="flex justify-between text-sm pt-2 border-t">
          <span className="text-muted-foreground">Subtotal</span>
          <span>{currencyFormat(totalPrice)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Taxa de Entrega</span>
          <span>{currencyFormat(deliveryFee)}</span>
        </div>
        <div className="flex justify-between text-base font-bold pt-2 border-t">
          <span>Total</span>
          <span>{currencyFormat(finalTotal)}</span>
        </div>
      </CardContent>
    </Card>
  );
};
