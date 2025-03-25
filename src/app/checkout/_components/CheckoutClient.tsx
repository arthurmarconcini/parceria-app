"use client";

import { Button } from "@/app/_components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/app/_components/ui/card";
import { Label } from "@/app/_components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/app/_components/ui/radio-group";
import currencyFormat from "@/app/_helpers/currency-format";
import { useCartStore } from "@/app/_hooks/cartStore";
import { Address } from "@prisma/client";

// Ajuste o caminho para seu hook
import { useRouter } from "next/navigation";

type CheckoutClientProps = {
  addresses: Address[];
};

export default function CheckoutClient({ addresses }: CheckoutClientProps) {
  const { cart, getTotalPrice, clearCart } = useCartStore(); // Usando seu hook
  const total = getTotalPrice();
  const router = useRouter();

  const handleSubmit = async (formData: FormData) => {
    const addressId = formData.get("addressId") as string;
    const paymentMethod = formData.get("paymentMethod") as string;

    // Simulação de envio do pedido
    console.log("Pedido fictício criado:", {
      addressId,
      paymentMethod,
      total,
      items: cart,
    });

    // Limpa o carrinho após o pedido
    clearCart();

    // Redireciona para confirmação
    router.push("/order-confirmation");
  };

  return (
    <>
      {/* Resumo do Pedido */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Resumo do Pedido</CardTitle>
        </CardHeader>
        <CardContent>
          {cart.length === 0 ? (
            <p>Carrinho vazio</p>
          ) : (
            <>
              <ul className="space-y-1">
                {cart.map((item) => (
                  <li
                    key={item.cartItemId}
                    className="flex flex-col justify-between"
                  >
                    <div className="flex justify-between">
                      <span>
                        {item.name} (x{item.quantity})
                      </span>
                      <span>
                        {currencyFormat(
                          (item.priceAtTime +
                            item.orderExtras.reduce((total, item) => {
                              return total + item.priceAtTime * item.quantity;
                            }, 0)) *
                            item.quantity
                        )}
                      </span>
                    </div>

                    <span className="text-sm text-muted-foreground ml-2">
                      {item.orderExtras.map((extra, index) => (
                        <span key={index}>
                          {extra.name + `(x${extra.quantity})`}
                          {index < item.orderExtras.length - 1 ? ", " : ""}
                        </span>
                      ))}
                    </span>
                  </li>
                ))}
              </ul>
              <p className="mt-4 font-bold">Total: R$ {total.toFixed(2)}</p>
            </>
          )}
        </CardContent>
      </Card>

      {/* Forma de Pagamento */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Forma de Pagamento</CardTitle>
        </CardHeader>
        <CardContent>
          <RadioGroup defaultValue="pix" name="paymentMethod">
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="pix" id="pix" />
              <Label htmlFor="pix">Pix na maquininha</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="credit_card" id="credit_card" />
              <Label htmlFor="credit_card">
                Cartão de Crédito ou Debito na maquininha
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="cash" id="cash" />
              <Label htmlFor="cash">Dinheiro na Entrega</Label>
            </div>
          </RadioGroup>
        </CardContent>
      </Card>

      {/* Botão de Finalizar */}
      <form action={handleSubmit}>
        <input
          type="hidden"
          name="addressId"
          value={addresses.find((a) => a.isDefault)?.id || addresses[0]?.id}
        />
        <Button
          type="submit"
          className="w-full"
          disabled={cart.length === 0 || addresses.length === 0}
        >
          Finalizar Pedido
        </Button>
      </form>
    </>
  );
}
