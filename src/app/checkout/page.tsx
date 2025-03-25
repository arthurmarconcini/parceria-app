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
import { auth } from "../api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { db } from "../_lib/prisma";

export default async function CheckoutPage() {
  const session = await auth();

  const addresses = await db.address.findMany({
    where: {
      userId: session?.user?.id,
    },
  });

  if (!session) {
    return redirect("/login");
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Finalizar Pedido</h1>

      {/* Seção de Endereços */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Endereço de Entrega</CardTitle>
        </CardHeader>
        <CardContent>
          {addresses.length === 0 ? (
            <p>Nenhum endereço cadastrado.</p>
          ) : (
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
          )}
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
