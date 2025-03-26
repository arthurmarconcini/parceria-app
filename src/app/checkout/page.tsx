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

      {/* Componente Cliente para o Carrinho e Pagamento */}
      <CheckoutClient addresses={addresses} userId={session?.user?.id} />
    </div>
  );
}
