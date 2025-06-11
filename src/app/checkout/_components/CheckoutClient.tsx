"use client";

import currencyFormat from "@/helpers/currency-format";
import { useCartStore } from "@/hooks/cartStore";

import { Address, PaymentMethod } from "@prisma/client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import ConfirmDeleteAddressDialog from "./ConfirmDeleteAddressDialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";

type CheckoutClientProps = {
  addresses: Address[];
  userId: string | undefined;
};

export default function CheckoutClient({
  addresses,
  userId,
}: CheckoutClientProps) {
  const { cart, getTotalPrice, clearCart } = useCartStore();
  const total = getTotalPrice();
  const router = useRouter();

  const [selectedAddress, setSelectedAddress] = useState<string | null>(
    addresses.find((a) => a.isDefault)?.id || null
  );
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("PIX");
  const [requiresChange, setRequiresChange] = useState<boolean>(false);
  const [changeFor, setChangeFor] = useState<number | null>(null);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);

  const handleAddressChange = (value: string) => {
    setSelectedAddress(value);
  };

  const handlePaymentMethodChange = (value: PaymentMethod) => {
    setPaymentMethod(value);
    if (value !== "CASH") {
      setRequiresChange(false);
      setChangeFor(null);
    }
  };

  const handleRequiresChange = (checked: boolean) => {
    setRequiresChange(checked);
    if (!checked) {
      setChangeFor(null);
    }
  };

  const handleChangeForChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    setChangeFor(isNaN(value) || value <= 0 ? null : value);
  };

  const handleConfirmModalOpen = () => {
    setConfirmModalOpen(!confirmModalOpen);
  };

  const handleDeleteAddress = async (addressId: string) => {
    try {
      const response = await fetch(`/api/address/${addressId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Erro ao excluir endereço.");
      }

      router.refresh();
    } catch (error) {
      console.error("Erro ao excluir endereço:", error);
      alert("Erro ao excluir endereço. Tente novamente.");
    }
  };

  const handleSubmit = async () => {
    if (!userId) {
      alert("Usuário não autenticado.");
      return;
    }

    if (!selectedAddress) {
      alert("Por favor, selecione um endereço.");
      return;
    }

    if (cart.length === 0) {
      alert("O carrinho está vazio.");
      return;
    }

    if (
      paymentMethod === "CASH" &&
      requiresChange &&
      (!changeFor || changeFor <= total)
    ) {
      alert(
        "Por favor, informe um valor válido para o troco maior que o total."
      );
      return;
    }

    const orderData = {
      userId,
      addressId: selectedAddress,
      total,
      paymentMethod,
      requiresChange: paymentMethod === "CASH" ? requiresChange : null,
      changeFor: paymentMethod === "CASH" && requiresChange ? changeFor : null,
      items: cart.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        priceAtTime: item.priceAtTime,
        observation: item.observation || null,
        orderExtras: item.orderExtras.map((extra) => ({
          extraId: extra.extraId,
          quantity: extra.quantity,
          priceAtTime: extra.priceAtTime,
        })),
      })),
    };

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData),
      });

      const createdOrder = await response.json();

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Erro ao criar pedido.");
      }

      clearCart();
      router.push(`/confirmacao?orderId=${createdOrder.id}`);
    } catch (error) {
      console.error("Erro ao finalizar pedido:", error);
      alert("Erro ao finalizar pedido. Tente novamente.");
    }
  };

  return (
    <>
      {/* Seção de Endereços */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Endereço de Entrega</CardTitle>
        </CardHeader>
        <CardContent>
          {addresses.length === 0 ? (
            <p>Nenhum endereço cadastrado.</p>
          ) : (
            <RadioGroup
              value={selectedAddress || undefined}
              onValueChange={handleAddressChange}
            >
              {addresses.map((address) => (
                <div key={address.id} className="flex items-center space-x-2">
                  <RadioGroupItem value={address.id} id={address.id} />
                  <div className="flex items-center gap-4 w-full">
                    <Label htmlFor={address.id}>
                      {address.street}, {address.number} - {address.city || ""},{" "}
                      {address.state || ""} ({address.zipCode})
                    </Label>
                    <ConfirmDeleteAddressDialog
                      addressId={address.id}
                      handleDeleteAddress={handleDeleteAddress}
                      open={confirmModalOpen}
                      modalOpen={handleConfirmModalOpen}
                    />
                  </div>
                </div>
              ))}
            </RadioGroup>
          )}
          <Button variant="outline" className="mt-4" asChild>
            <Link href="/checkout/add-address">Adicionar Novo Endereço</Link>
          </Button>
        </CardContent>
      </Card>

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
                            item.orderExtras.reduce((total, extra) => {
                              return total + extra.priceAtTime * extra.quantity;
                            }, 0)) *
                            item.quantity
                        )}
                      </span>
                    </div>
                    {item.orderExtras.length > 0 && (
                      <span className="text-sm text-muted-foreground ml-2">
                        {item.orderExtras.map((extra, index) => (
                          <span key={index}>
                            {extra.name} (x{extra.quantity})
                            {index < item.orderExtras.length - 1 ? ", " : ""}
                          </span>
                        ))}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
              <p className="mt-4 font-bold">Total: {currencyFormat(total)}</p>
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
          <RadioGroup
            value={paymentMethod}
            onValueChange={handlePaymentMethodChange}
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="PIX" id="pix" />
              <Label htmlFor="pix">Pix</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="CREDIT_CARD" id="credit_card" />
              <Label htmlFor="credit_card">Cartão de Crédito</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="DEBIT_CARD" id="debit_card" />
              <Label htmlFor="debit_card">Cartão de Débito</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="CASH" id="cash" />
              <Label htmlFor="cash">Dinheiro na Entrega</Label>
            </div>
          </RadioGroup>
          {paymentMethod === "CASH" && (
            <div className="mt-4 ml-2 flex flex-col gap-2">
              <div className="flex gap-2 items-center">
                <Checkbox
                  id="require_change"
                  checked={requiresChange}
                  onCheckedChange={handleRequiresChange}
                />
                <Label htmlFor="require_change">Precisa de troco?</Label>
              </div>
              {requiresChange && (
                <div className="gap-2 flex flex-col">
                  <Label htmlFor="change">Troco para quanto? (R$)</Label>
                  <Input
                    value={changeFor ?? ""}
                    onChange={handleChangeForChange}
                    type="number"
                    step="0.01"
                    min={total + 0.01} // Garante que o troco seja maior que o total
                    id="change"
                    placeholder={`Ex.: ${(total + 10).toFixed(2)}`}
                  />
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Botão de Finalizar */}
      <Button
        onClick={handleSubmit}
        className="w-full"
        disabled={
          cart.length === 0 ||
          !selectedAddress ||
          (paymentMethod === "CASH" &&
            requiresChange &&
            (!changeFor || changeFor <= total))
        }
      >
        Finalizar Pedido
      </Button>
    </>
  );
}
