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

const Cart = () => {
  const { cart } = useCartStore();

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button className="text-white">CARRINHO</Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Carrinho de compras</SheetTitle>
        </SheetHeader>

        <div className="">
          <div className="flex justify-between items-center p-4">
            <h1 className="text-sm font-bold">Itens adicionados</h1>
            <Button variant="ghost" className="text-destructive text-xs">
              Limpar
            </Button>
          </div>
          <div>
            {cart.map((item) => (
              <CartItem key={item.productId} item={item} />
            ))}
          </div>
        </div>
        <div className="p-4 flex flex-col gap-4">
          <h1 className="text-sm font-bold">Resumo de valores</h1>
          <div className="flex flex-col gap-2">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Subtotal</span>
              <span>R$ 100,00</span>
            </div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Taxa de entrega</span>
              <span>R$ 10,00</span>
            </div>
            <div className="flex justify-between text-xs font-bold">
              <span>Total</span>
              <span>R$ 110,00</span>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default Cart;
