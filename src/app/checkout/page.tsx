import CheckoutClient from "./components/CheckoutClient";
import { db } from "../../lib/prisma";
import { auth } from "@/auth";

export default async function CheckoutPage() {
  const session = await auth();

  const addresses = session?.user?.id
    ? await db.address.findMany({
        where: {
          userId: session.user.id,
        },
        include: {
          locality: true,
        },
        orderBy: {
          isDefault: "desc",
        },
      })
    : [];

  return (
    <div className="container mx-auto p-4 md:p-6">
      <h1 className="text-2xl font-bold mb-6">Finalizar Pedido</h1>

      <CheckoutClient addresses={addresses} user={session?.user} />
    </div>
  );
}
