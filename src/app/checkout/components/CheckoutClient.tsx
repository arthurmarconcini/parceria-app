"use client";

import { PaymentMethod, Prisma, RestaurantCity } from "@prisma/client";
import { redirect, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useCartStore } from "@/hooks/cartStore";
import currencyFormat from "@/helpers/currency-format";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { GuestInfoForm } from "./GuestInfoForm";
import { GuestAddressForm } from "./GuestAddressForm";
import { AddressSelection } from "./AddressSelection";
import { OrderSummary } from "./OrderSummary";
import { PaymentMethods } from "./PaymentMethods";
import { useStoreStatus } from "@/hooks/use-store-status";

// Tipos
export type UserPayload = {
  id: string;
  name?: string | null;
  email?: string | null;
};

export type LocalityWithCity = Prisma.LocalityGetPayload<{
  include: { city: true };
}> & { state: string };

type CheckoutClientProps = {
  addresses: AddressWithLocality[];
  user: UserPayload | null | undefined;
  restaurantCity: RestaurantCity;
  restaurantState: string;
};

export type AddressWithLocality = Prisma.AddressGetPayload<{
  include: {
    locality: true; // Isso garante que 'locality' tem todas as propriedades do model
  };
}>;

export type GuestAddressState = {
  street: string;
  number: string;
  reference: string;
  observation: string;
  localityId: string;
  zipCode: string;
};

export default function CheckoutClient({
  addresses: initialAddresses,
  user,
  restaurantCity,
  restaurantState,
}: CheckoutClientProps) {
  const router = useRouter();
  const { cart, getTotalPrice, clearCart } = useCartStore();
  const { isOpen } = useStoreStatus();

  const [isGuest] = useState(!user);
  const [addresses, setAddresses] =
    useState<AddressWithLocality[]>(initialAddresses);
  const [localities, setLocalities] = useState<LocalityWithCity[]>([]);
  const [isLoadingLocalities, setIsLoadingLocalities] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [guestName, setGuestName] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(
    addresses.find((a) => a.isDefault)?.id || addresses[0]?.id || null
  );
  const [guestAddress, setGuestAddress] = useState<GuestAddressState>({
    street: "",
    number: "",
    reference: "",
    observation: "",
    localityId: "",
    zipCode: "",
  });
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("PIX");
  const [requiresChange, setRequiresChange] = useState(false);
  const [changeFor, setChangeFor] = useState<number | null>(null);

  const totalPrice = getTotalPrice();
  const selectedLocality = isGuest
    ? localities.find((loc) => loc.id === guestAddress.localityId)
    : localities.find(
        (loc) =>
          loc.id ===
          addresses.find((a) => a.id === selectedAddressId)?.localityId
      );
  const deliveryFee = selectedLocality?.deliveryFee ?? 0;
  const finalTotal = totalPrice + deliveryFee;

  useEffect(() => {
    const fetchLocalities = async () => {
      setIsLoadingLocalities(true);
      try {
        const response = await fetch("/api/localities");
        if (!response.ok) throw new Error("Falha ao buscar localidades");
        const data: LocalityWithCity[] = await response.json();
        setLocalities(data);
      } catch (e) {
        console.error(e);
        toast.error("Não foi possível carregar as áreas de entrega.");
      } finally {
        setIsLoadingLocalities(false);
      }
    };
    fetchLocalities();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    if (cart.length === 0) {
      setError("Seu carrinho está vazio.");
      setIsSubmitting(false);
      return;
    }

    let finalAddressPayload;
    if (isGuest) {
      if (!guestName.trim() || !guestPhone.trim()) {
        setError("Por favor, preencha seu nome e celular.");
        setIsSubmitting(false);
        return;
      }
      if (
        !guestAddress.street.trim() ||
        !guestAddress.number.trim() ||
        !guestAddress.localityId
      ) {
        setError("Por favor, preencha todos os campos do endereço.");
        setIsSubmitting(false);
        return;
      }
      const guestSelectedLocality = localities.find(
        (loc) => loc.id === guestAddress.localityId
      );
      if (!guestSelectedLocality) {
        setError("Localidade inválida.");
        setIsSubmitting(false);
        return;
      }
      finalAddressPayload = {
        ...guestAddress,
        city: guestSelectedLocality.city.name,
        state: guestSelectedLocality.state,
      };
    } else if (!selectedAddressId) {
      setError("Por favor, selecione ou adicione um endereço de entrega.");
      setIsSubmitting(false);
      return;
    }

    if (
      paymentMethod === "CASH" &&
      requiresChange &&
      (!changeFor || changeFor < finalTotal)
    ) {
      setError("O valor do troco deve ser maior que o total do pedido.");
      setIsSubmitting(false);
      return;
    }

    const orderData = {
      total: totalPrice,
      deliveryFee,
      paymentMethod,
      requiresChange: paymentMethod === "CASH" ? requiresChange : null,
      changeFor: paymentMethod === "CASH" && requiresChange ? changeFor : null,
      items: cart.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        priceAtTime: item.priceAtTime,
        observation: item.observation,
        sizeId: item.sizeId,
        orderExtras: item.orderExtras,
        halfhalf: item.halfhalf,
      })),
      ...(isGuest
        ? { guestName, guestPhone, address: finalAddressPayload }
        : { userId: user?.id, addressId: selectedAddressId }),
    };

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || "Ocorreu um erro ao criar o pedido."
        );
      }

      const createdOrder = await response.json();
      clearCart();
      router.push(`/confirmacao?orderId=${createdOrder.id}`);
      toast.success("Pedido realizado com sucesso!");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) {
    return redirect("/");
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="grid grid-cols-1 lg:grid-cols-3 gap-8"
    >
      <div className="lg:col-span-2 space-y-6">
        {isGuest && (
          <GuestInfoForm
            guestName={guestName}
            setGuestName={setGuestName}
            guestPhone={guestPhone}
            setGuestPhone={setGuestPhone}
          />
        )}

        {isGuest ? (
          <GuestAddressForm
            guestAddress={guestAddress}
            setGuestAddress={setGuestAddress}
            localities={localities}
            isLoadingLocalities={isLoadingLocalities}
          />
        ) : (
          <AddressSelection
            addresses={addresses}
            setAddresses={setAddresses}
            selectedAddressId={selectedAddressId}
            setSelectedAddressId={setSelectedAddressId}
            localities={localities}
            restaurantCity={restaurantCity}
            restaurantState={restaurantState}
          />
        )}
      </div>

      <div className="lg:col-span-1 space-y-6">
        <OrderSummary
          cart={cart}
          totalPrice={totalPrice}
          deliveryFee={deliveryFee}
          finalTotal={finalTotal}
        />

        <PaymentMethods
          paymentMethod={paymentMethod}
          setPaymentMethod={setPaymentMethod}
          requiresChange={requiresChange}
          setRequiresChange={setRequiresChange}
          changeFor={changeFor}
          setChangeFor={setChangeFor}
        />

        {error && (
          <p className="text-sm text-center text-destructive">{error}</p>
        )}

        <Button
          type="submit"
          className="w-full"
          size="lg"
          disabled={isSubmitting || cart.length === 0 || !isOpen}
        >
          {isOpen ? (
            isSubmitting ? (
              <Loader2 className="animate-spin" />
            ) : (
              `Finalizar Pedido (${currencyFormat(finalTotal)})`
            )
          ) : (
            "Loja Fechada"
          )}
        </Button>
      </div>
    </form>
  );
}
