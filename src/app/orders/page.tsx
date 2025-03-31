import { redirect } from "next/navigation";
import { db } from "../_lib/prisma";
import { auth } from "../api/auth/[...nextauth]/route";
import OrderList from "./_components/OrderList";

const OrdersPage = async () => {
  const session = await auth();

  if (!session || !session.user || !session.user.id) {
    return redirect("/login");
  }

  const orders = await db.order.findMany({
    where: {
      userId: session.user.id,
    },
    include: {
      items: {
        include: {
          product: true,
          orderExtras: {
            include: {
              extra: true,
            },
          },
        },
      },
    },
  });

  return (
    <div className="contanier mx-auto p-4">
      <h1 className="text-lg font-bold mb-6">Meus pedidos</h1>
      <OrderList orders={orders} />
    </div>
  );
};

export default OrdersPage;
