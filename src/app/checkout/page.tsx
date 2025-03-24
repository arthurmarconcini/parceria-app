import Link from "next/link";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../_components/ui/card";

import { Button } from "../_components/ui/button";
import { RadioGroup, RadioGroupItem } from "../_components/ui/radio-group";
import { Label } from "../_components/ui/label";
import CheckoutClient from "./_components/CheckoutClient";

// Lista fictícia de endereços
const mockAddresses = [
  {
    id: "1",
    street: "Rua das Flores",
    number: "123",
    city: "São Paulo",
    state: "SP",
    zipCode: "01234-567",
    isDefault: true,
  },
  {
    id: "2",
    street: "Avenida Central",
    number: "456",
    city: "Rio de Janeiro",
    state: "RJ",
    zipCode: "89012-345",
    isDefault: false,
  },
];

export default async function CheckoutPage() {
  const addresses = mockAddresses;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Finalizar Pedido</h1>

      {/* Seção de Endereços */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Endereço de Entrega</CardTitle>
        </CardHeader>
        <CardContent>
          <RadioGroup defaultValue={addresses.find((a) => a.isDefault)?.id}>
            {addresses.map((address) => (
              <div key={address.id} className="flex items-center space-x-2">
                <RadioGroupItem value={address.id} id={address.id} />
                <Label htmlFor={address.id}>
                  {address.street}, {address.number} - {address.city},{" "}
                  {address.state} ({address.zipCode})
                </Label>
              </div>
            ))}
          </RadioGroup>
          <Button variant="outline" className="mt-4" asChild>
            <Link href="/checkout/add-address">Adicionar Novo Endereço</Link>
          </Button>
        </CardContent>
      </Card>

      {/* Componente Cliente para o Carrinho e Pagamento */}
      <CheckoutClient addresses={addresses} />
    </div>
  );
}
