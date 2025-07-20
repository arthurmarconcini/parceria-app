"use client";

import { useCartStore } from "../../hooks/cartStore";
import CartItem from "./CartItem";
import { Button } from "../ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "../ui/sheet";
import { ScrollArea, ScrollBar } from "../ui/scroll-area";
import currencyFormat from "@/helpers/currency-format";
import { ShoppingCartIcon, Trash2Icon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useEffect, useState, useCallback } from "react";
import { Input } from "../ui/input";

import { Locality, Address } from "@prisma/client";
import { toast } from "sonner";

type AddressWithLocality = Address & { locality: Locality | null };

const Cart = () => {
  const {
    cart,
    clearCart,
    isCartOpen,
    toggleCart,
    getTotalPrice,
    deliveryFee,
    shippingInfo,
    setDeliveryFee,
  } = useCartStore();
  const { data: session } = useSession();
  const router = useRouter();
  const [cep, setCep] = useState("");
  const [localities, setLocalities] = useState<Locality[]>([]);
  const [isLoadingLocalities, setIsLoadingLocalities] = useState(true);

  useEffect(() => {
    setIsLoadingLocalities(true);

    const fetchLocalities = async () => {
      try {
        const response = await fetch("/api/localities");
        const data = await response.json();
        setLocalities(data);
      } catch (error) {
        toast.error(
          error instanceof Error
            ? error.message
            : "Erro ao carregar áreas de entrega."
        );
      } finally {
        setIsLoadingLocalities(false);
      }
    };
    fetchLocalities();
  }, []);

  const calculateDeliveryFee = useCallback(
    (bairro: string, id: string, type: "address" | "cep") => {
      if (isLoadingLocalities || localities.length === 0) return;

      const locality = localities.find(
        (loc) => loc.name.toLowerCase() === bairro.toLowerCase()
      );

      if (locality) {
        setDeliveryFee(locality.deliveryFee, { type, value: id });
      } else {
        setDeliveryFee(0, null);
        console.log(
          `Bairro "${bairro}" não encontrado nas localidades. ${locality}`
        );

        toast.error("Não entregamos na sua região.");
      }
    },
    [localities, setDeliveryFee, isLoadingLocalities]
  );

  useEffect(() => {
    const handleShipping = async () => {
      if (isLoadingLocalities) {
        return;
      }

      if (session?.user) {
        try {
          const res = await fetch("/api/user/address");
          if (!res.ok) {
            setDeliveryFee(0, null);
            return;
          }
          const { address }: { address: AddressWithLocality } =
            await res.json();
          if (address?.locality) {
            calculateDeliveryFee(address.locality.name, address.id, "address");
          } else {
            setDeliveryFee(0, null);
          }
        } catch (error) {
          toast.error(
            error instanceof Error ? error.message : "Erro ao obter endereço."
          );
          setDeliveryFee(0, null);
        }
      } else {
        const cepDigits = cep.replace(/\D/g, "");
        if (cepDigits.length === 8) {
          try {
            const res = await fetch(
              `https://viacep.com.br/ws/${cepDigits}/json/`
            );
            const addressData = await res.json();
            if (addressData.erro) {
              setDeliveryFee(0, null);
              toast.error("CEP não encontrado.");
              return;
            }
            calculateDeliveryFee(addressData.bairro, cep, "cep");
          } catch (error) {
            setDeliveryFee(0, null);
            toast.error(
              error instanceof Error
                ? error.message
                : "Erro ao consultar o CEP."
            );
          }
        } else {
          setDeliveryFee(0, null);
        }
      }
    };

    handleShipping();
  }, [
    session,
    cep,
    localities,
    calculateDeliveryFee,
    setDeliveryFee,
    isLoadingLocalities,
  ]);

  function handleCheckout() {
    toggleCart();
    router.push("/checkout");
  }

  const subtotal = getTotalPrice();
  const total = subtotal + deliveryFee;
  const totalItemsInCart = cart.reduce(
    (total, item) => total + item.quantity,
    0
  );

  return (
    <Sheet open={isCartOpen} onOpenChange={toggleCart}>
      <SheetTrigger asChild>
        <Button
          variant={"ghost"}
          size="icon"
          className="relative text-foreground hover:bg-accent hover:text-accent-foreground"
          aria-label={`Abrir carrinho com ${totalItemsInCart} itens`}
        >
          <ShoppingCartIcon className="h-5 w-5" />
          {totalItemsInCart > 0 && (
            <span
              className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground"
              aria-hidden="true"
            >
              {totalItemsInCart > 9 ? "9+" : totalItemsInCart}
            </span>
          )}
        </Button>
      </SheetTrigger>

      <SheetContent className="flex w-full flex-col p-0 sm:max-w-sm md:max-w-md">
        <SheetHeader className="border-b px-4 py-3">
          <SheetTitle className="text-lg">Carrinho de Compras</SheetTitle>
        </SheetHeader>

        {cart.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center p-6 text-center">
            <ShoppingCartIcon className="mb-4 h-16 w-16 text-muted-foreground/70" />
            <span className="text-xl font-medium text-foreground">
              Seu carrinho está vazio!
            </span>
            <p className="mt-1 text-sm text-muted-foreground">
              Que tal adicionar alguns itens deliciosos?
            </p>
            <Button variant="outline" className="mt-8" onClick={toggleCart}>
              Continuar Comprando
            </Button>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between border-b px-4 py-3">
              <h3 className="text-sm font-semibold text-foreground">
                {totalItemsInCart} {totalItemsInCart === 1 ? "item" : "itens"}
              </h3>
              <Button
                onClick={clearCart}
                variant="outline"
                size="sm"
                className="h-8 gap-1 text-xs text-destructive hover:border-destructive/50 hover:bg-destructive/10 hover:text-destructive"
              >
                <Trash2Icon className="h-3.5 w-3.5" />
                Limpar
              </Button>
            </div>

            <div className="flex-1 overflow-auto">
              <ScrollArea className="h-full">
                <div className="flex flex-col gap-4 p-4">
                  {cart.map((item) => (
                    <CartItem key={item.cartItemId} item={item} />
                  ))}
                </div>
                <ScrollBar orientation="vertical" />
              </ScrollArea>
            </div>

            <div className="mt-auto border-t bg-background p-4 shadow-inner space-y-4">
              <div>
                <h3 className="mb-2 text-sm font-semibold text-foreground">
                  Resumo de valores
                </h3>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Subtotal</span>
                    <span>{currencyFormat(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Taxa de entrega</span>
                    <span>
                      {shippingInfo
                        ? deliveryFee > 0
                          ? currencyFormat(deliveryFee)
                          : "Grátis"
                        : "Informe o CEP"}
                    </span>
                  </div>
                  <div className="mt-2 flex justify-between border-t pt-2 text-base font-bold text-foreground">
                    <span>Total</span>
                    <span>{currencyFormat(total)}</span>
                  </div>
                </div>
              </div>

              {session?.user ? (
                <div className="text-center text-xs text-muted-foreground">
                  <span>Entrega no seu endereço padrão.</span>
                </div>
              ) : (
                <div className="space-y-2">
                  <Input
                    type="text"
                    placeholder="Digite seu CEP para entrega"
                    value={cep}
                    onChange={(e) => setCep(e.target.value)}
                  />
                  <p className="text-xs text-center text-muted-foreground">
                    Já tem uma conta?{" "}
                    <Button
                      variant="link"
                      className="p-0 h-auto"
                      onClick={() => router.push("/login")}
                    >
                      Faça login
                    </Button>
                  </p>
                </div>
              )}

              <Button
                onClick={handleCheckout}
                className="w-full"
                size="lg"
                disabled={
                  cart.length === 0 ||
                  (!shippingInfo && session?.user === undefined)
                }
              >
                Finalizar Compra
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default Cart;
