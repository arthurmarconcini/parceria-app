"use client";

import { Address, Locality, PaymentMethod, Prisma } from "@prisma/client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";

import { useCartStore } from "@/hooks/cartStore";
import currencyFormat from "@/helpers/currency-format";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import ConfirmDeleteAddressDialog from "./ConfirmDeleteAddressDialog";
import { Loader2, Trash2Icon } from "lucide-react";

// Tipos
type UserPayload = {
  id: string;
  name?: string | null;
  email?: string | null;
};

type LocalityWithCity = Prisma.LocalityGetPayload<{
  include: { city: true };
}> & { state: string };

type CheckoutClientProps = {
  addresses: (Address & { locality: Locality | null })[];
  user: UserPayload | null | undefined;
};

type GuestAddressState = {
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
}: CheckoutClientProps) {
  const router = useRouter();
  const { cart, getTotalPrice, clearCart } = useCartStore();

  const [isGuest] = useState(!user);
  const [addresses, setAddresses] = useState(initialAddresses);
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

  const [isConfirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [addressToDeleteId, setAddressToDeleteId] = useState<string | null>(
    null
  );

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
        if (!response.ok) {
          throw new Error(
            `Falha ao buscar localidades: ${response.statusText}`
          );
        }
        const data: LocalityWithCity[] = await response.json();

        console.log("Localidades recebidas da API:", data);

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

  const handleAddressChange = (value: string) => setSelectedAddressId(value);

  const handleGuestAddressChange = (
    field: keyof GuestAddressState,
    value: string
  ) => {
    setGuestAddress((prev) => ({ ...prev, [field]: value }));
  };

  const handlePaymentMethodChange = (value: PaymentMethod) => {
    setPaymentMethod(value);
    if (value !== "CASH") setRequiresChange(false);
  };

  const openDeleteModal = (addressId: string) => {
    setAddressToDeleteId(addressId);
    setConfirmDeleteOpen(true);
  };

  const handleDeleteAddress = async () => {
    if (!addressToDeleteId) return;

    try {
      const response = await fetch(`/api/address/${addressToDeleteId}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Falha ao excluir endereço.");

      setAddresses((prev) =>
        prev.filter((addr) => addr.id !== addressToDeleteId)
      );
      if (selectedAddressId === addressToDeleteId) setSelectedAddressId(null);

      toast.success("Endereço excluído com sucesso.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro desconhecido.");
    } finally {
      setConfirmDeleteOpen(false);
      setAddressToDeleteId(null);
    }
  };

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
        : { userId: user?.id, address: selectedAddressId }),
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

  return (
    <form
      onSubmit={handleSubmit}
      className="grid grid-cols-1 lg:grid-cols-3 gap-8"
    >
      <div className="lg:col-span-2 space-y-6">
        {isGuest && (
          <Card>
            <CardHeader>
              <CardTitle>1. Seus Dados</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label htmlFor="guestName">Nome</Label>
                <Input
                  id="guestName"
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  placeholder="Seu nome completo"
                  required
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="guestPhone">Celular (WhatsApp)</Label>
                <Input
                  id="guestPhone"
                  value={guestPhone}
                  onChange={(e) => setGuestPhone(e.target.value)}
                  type="tel"
                  placeholder="(00) 00000-0000"
                  required
                />
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>
              {isGuest ? "2. Endereço de Entrega" : "1. Endereço de Entrega"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isGuest ? (
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="col-span-2 space-y-1">
                    <Label htmlFor="street">Rua</Label>
                    <Input
                      id="street"
                      value={guestAddress.street}
                      onChange={(e) =>
                        handleGuestAddressChange("street", e.target.value)
                      }
                      required
                    />
                  </div>
                  <div className="col-span-1 space-y-1">
                    <Label htmlFor="number">Número</Label>
                    <Input
                      id="number"
                      value={guestAddress.number}
                      onChange={(e) =>
                        handleGuestAddressChange("number", e.target.value)
                      }
                      required
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <Label htmlFor="locality">Bairro</Label>

                  <Select
                    name="localityId"
                    value={guestAddress.localityId}
                    onValueChange={(value) =>
                      handleGuestAddressChange("localityId", value)
                    }
                    required
                    disabled={isLoadingLocalities}
                  >
                    <SelectTrigger>
                      <SelectValue
                        placeholder={
                          isLoadingLocalities
                            ? "Carregando bairros..."
                            : "Selecione o bairro"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {localities.map((loc) => (
                        <SelectItem key={loc.id} value={loc.id}>
                          {loc.name} (+{currencyFormat(loc.deliveryFee)})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label htmlFor="reference">Referência (opcional)</Label>
                  <Input
                    id="reference"
                    value={guestAddress.reference}
                    onChange={(e) =>
                      handleGuestAddressChange("reference", e.target.value)
                    }
                    placeholder="Ex: Perto da padaria"
                  />
                </div>
              </div>
            ) : (
              <>
                <RadioGroup
                  value={selectedAddressId || ""}
                  onValueChange={handleAddressChange}
                  className="space-y-2"
                >
                  {addresses.map((address) => (
                    <Label
                      key={address.id}
                      htmlFor={address.id}
                      className="flex items-center justify-between p-3 border rounded-md cursor-pointer has-[input:checked]:border-primary has-[input:checked]:bg-primary/5 transition-all"
                    >
                      <div className="flex items-center gap-4">
                        <RadioGroupItem value={address.id} id={address.id} />
                        <span>
                          {address.street}, {address.number} -{" "}
                          {address.locality?.name}
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={(e) => {
                          e.preventDefault();
                          openDeleteModal(address.id);
                        }}
                      >
                        <Trash2Icon className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                      </Button>
                    </Label>
                  ))}
                </RadioGroup>
                <Button variant="outline" className="mt-4" asChild>
                  <Link href="/checkout/add-address">
                    Adicionar Novo Endereço
                  </Link>
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="lg:col-span-1 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Resumo do Pedido</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {cart.map((item) => (
              <div
                key={item.cartItemId}
                className="flex justify-between text-sm"
              >
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

        <Card>
          <CardHeader>
            <CardTitle>Forma de Pagamento</CardTitle>
          </CardHeader>
          <CardContent>
            <RadioGroup
              value={paymentMethod}
              onValueChange={(val) =>
                handlePaymentMethodChange(val as PaymentMethod)
              }
              className="space-y-2"
            >
              <Label className="flex items-center gap-2">
                <RadioGroupItem value="PIX" /> Pix
              </Label>
              <Label className="flex items-center gap-2">
                <RadioGroupItem value="CREDIT_CARD" /> Cartão de Crédito
              </Label>
              <Label className="flex items-center gap-2">
                <RadioGroupItem value="DEBIT_CARD" /> Cartão de Débito
              </Label>
              <Label className="flex items-center gap-2">
                <RadioGroupItem value="CASH" /> Dinheiro
              </Label>
            </RadioGroup>
            {paymentMethod === "CASH" && (
              <div className="mt-4 space-y-4 p-3 bg-muted/50 rounded-md">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="requiresChange"
                    checked={requiresChange}
                    onCheckedChange={(checked) => setRequiresChange(!!checked)}
                  />{" "}
                  <Label htmlFor="requiresChange">Precisa de troco?</Label>
                </div>
                {requiresChange && (
                  <Input
                    value={changeFor || ""}
                    onChange={(e) => setChangeFor(parseFloat(e.target.value))}
                    type="number"
                    placeholder="Troco para quanto?"
                  />
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {error && (
          <p className="text-sm text-center text-destructive">{error}</p>
        )}

        <Button
          type="submit"
          className="w-full"
          size="lg"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <Loader2 className="animate-spin" />
          ) : (
            `Finalizar Pedido (${currencyFormat(finalTotal)})`
          )}
        </Button>
      </div>

      <ConfirmDeleteAddressDialog
        open={isConfirmDeleteOpen}
        modalOpen={setConfirmDeleteOpen}
        addressId={addressToDeleteId!}
        handleDeleteAddress={handleDeleteAddress}
      />
    </form>
  );
}
