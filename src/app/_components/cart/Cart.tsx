"use client";

import { useCartStore } from "../../_hooks/cartStore";
import CartItem from "./CartItem";
import { Button } from "../ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "../ui/sheet";
import { ScrollArea } from "../ui/scroll-area";
import currencyFormat from "@/app/_helpers/currency-format";
import { ShoppingCartIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

const Cart = () => {
  const { cart, clearCart, isCartOpen, toggleCart, getTotalPrice } =
    useCartStore();

  const { status } = useSession();

  const router = useRouter();

  function handleCheckout() {
    toggleCart();

    if (status !== "authenticated") {
      router.push("/login");
      return;
    }

    router.push("/checkout");
  }
  return (
    <Sheet open={isCartOpen} onOpenChange={toggleCart}>
      <SheetTrigger asChild>
        <Button className="text-white relative">
          {cart.length > 0 && (
            <div className="absolute bg-white text-black flex justify-center items-center rounded-full -bottom-1 -left-0.5 size-6">
              <p>
                {cart.reduce((total, item) => {
                  return total + item.quantity;
                }, 0)}
              </p>
            </div>
          )}

          <ShoppingCartIcon className="size-6" />
        </Button>
      </SheetTrigger>
      <SheetContent className="flex flex-col h-full p-0 overflow-hidden">
        <SheetHeader>
          <SheetTitle>Carrinho de compras</SheetTitle>
        </SheetHeader>

        {cart.length === 0 ? (
          <div className="p-4 text-center font-bold">
            <span>Não ha nada no carrinho!</span>
          </div>
        ) : (
          <div className="flex flex-col overflow-hidden">
            <div className="flex justify-between items-center p-4">
              <h1 className="text-sm font-bold">Itens adicionados</h1>
              <Button
                onClick={clearCart}
                variant="ghost"
                className="text-destructive text-xs"
              >
                Limpar
              </Button>
            </div>
            <ScrollArea className="max-h-[calc(100vh-250px)]">
              <div className="p-4 flex flex-col gap-4">
                {cart.map((item) => (
                  <CartItem key={item.cartItemId} item={item} />
                ))}
              </div>
            </ScrollArea>
          </div>
        )}

        <div className="p-4 flex flex-col gap-4">
          <h1 className="text-sm font-bold">Resumo de valores</h1>
          <div className="flex flex-col gap-2">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Subtotal</span>
              <span>{currencyFormat(getTotalPrice())}</span>
            </div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Taxa de entrega</span>
              <span>R$ 0,00</span>
            </div>
            <div className="flex justify-between text-xs font-bold">
              <span>Total</span>
              <span>{currencyFormat(getTotalPrice())}</span>
            </div>
          </div>
        </div>
        <div className="p-4">
          <Button onClick={handleCheckout} className="w-full">
            Finalizar compra
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default Cart;
