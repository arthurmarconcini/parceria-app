import { db } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { OrderExtra, OrderItem, PaymentMethod, Prisma } from "@prisma/client";
import Pusher from "pusher";

const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID!,
  key: process.env.PUSHER_KEY!,
  secret: process.env.PUSHER_SECRET!,
  cluster: process.env.PUSHER_CLUSTER!,
  useTLS: true,
});

export async function POST(req: NextRequest) {
  const {
    userId,
    addressId,
    total,
    paymentMethod,
    requiresChange,
    changeFor,
    items,
  } = await req.json();

  // Validação dos campos obrigatórios
  if (!userId || !addressId || !total || !paymentMethod) {
    return NextResponse.json(
      {
        error:
          "Campos obrigatórios ausentes: userId, addressId, total ou paymentMethod.",
      },
      { status: 400 }
    );
  }

  // Validação específica para CASH
  if (paymentMethod === "CASH") {
    if (requiresChange === true) {
      if (!changeFor || changeFor <= total) {
        return NextResponse.json(
          {
            error:
              "O valor do troco deve ser maior que o total quando troco é necessário.",
          },
          { status: 400 }
        );
      }
    }
  } else {
    // Garante que requiresChange e changeFor sejam null para métodos diferentes de CASH
    if (requiresChange !== null || changeFor !== null) {
      return NextResponse.json(
        {
          error:
            "requiresChange e changeFor devem ser null para métodos diferentes de CASH.",
        },
        { status: 400 }
      );
    }
  }

  // Validação dos itens
  if (!items || !Array.isArray(items) || items.length === 0) {
    return NextResponse.json(
      { error: "O pedido deve conter ao menos um item." },
      { status: 400 }
    );
  }

  const today = new Date().toISOString().split("T")[0];

  const ordersToday = await db.order.count({
    where: {
      createdAt: {
        gte: new Date(today), // Pedidos a partir de 00:00 do dia atual
        lt: new Date(new Date(today).setDate(new Date(today).getDate() + 1)), // Até 00:00 do próximo dia
      },
    },
  });

  const nextOrderNumber = String(ordersToday + 1).padStart(3, "0"); // Garante 3 dígitos (ex.: 001)
  const orderNumber = `${today}-${nextOrderNumber}`; // Ex.: 2025-05-07-001

  try {
    // 3. Modifique a criação do pedido para incluir todos os dados necessários no retorno
    const order = await db.order.create({
      data: {
        userId,
        addressId,
        total,
        orderNumber,
        paymentMethod: paymentMethod as PaymentMethod,
        requiresChange: paymentMethod === "CASH" ? requiresChange : null,
        changeFor:
          paymentMethod === "CASH" && requiresChange ? changeFor : null,
        items: {
          create: items.map((item: OrderItem) => ({
            productId: item.productId,
            quantity: item.quantity,
            priceAtTime: item.priceAtTime,
            observation: item.observation || null,
            sizeId: item.sizeId || null,
            // Importante: Tratamento de HalfHalf e Extras precisa ser feito após a criação do OrderItem
          })),
        },
      },
      // 4. Garanta que o `include` traga todos os dados que a sua UI precisa
      include: {
        items: {
          include: {
            product: true,
            Size: true,
            orderExtras: { include: { extra: true } },
            HalfHalf: { include: { firstHalf: true, secondHalf: true } },
          },
        },
        user: true,
        address: { include: { locality: true } },
      },
    });

    // Lógica para criar HalfHalf e OrderExtras, se houver
    const itemPromises = items.map(
      async (
        item: Prisma.OrderItemGetPayload<{
          include: {
            HalfHalf: { include: { firstHalf: true; secondHalf: true } };
            orderExtras: { include: { extra: true } };
          };
        }>,
        index: number
      ) => {
        const createdOrderItem = order.items[index];

        if (item.HalfHalf) {
          await db.halfHalf.create({
            data: {
              orderItemId: createdOrderItem.id,
              firstHalfId: item.HalfHalf.firstHalf.id,
              secondHalfId: item.HalfHalf.secondHalf.id,
            },
          });
        }

        if (item.orderExtras && item.orderExtras.length > 0) {
          await db.orderExtra.createMany({
            data: item.orderExtras.map((extra: OrderExtra) => ({
              orderItemId: createdOrderItem.id,
              extraId: extra.extraId,
              quantity: extra.quantity,
              priceAtTime: extra.priceAtTime,
            })),
          });
        }
      }
    );

    await Promise.all(itemPromises);

    // Recarrega o pedido completo com todas as relações após criar HalfHalf e Extras
    const completeOrder = await db.order.findUnique({
      where: { id: order.id },
      include: {
        items: {
          include: {
            product: true,
            Size: true,
            orderExtras: { include: { extra: true } },
            HalfHalf: { include: { firstHalf: true, secondHalf: true } },
          },
        },
        user: true,
        address: { include: { locality: true } },
      },
    });

    // 5. Dispare o evento para o Pusher após o sucesso da criação
    await pusher.trigger("pedidos", "novo-pedido", completeOrder);

    return NextResponse.json(completeOrder, { status: 201 }); // Retorna o pedido completo
  } catch (error) {
    console.error("Erro ao criar pedido:", error);
    return NextResponse.json(
      { error: "Erro ao criar pedido." },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Define para o início do dia (00:00:00)

    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1); // Define para o início do próximo dia

    const orders = await db.order.findMany({
      where: {
        createdAt: {
          gte: today, // Maior ou igual ao início de hoje
          lt: tomorrow, // Menor que o início de amanhã
        },
      },
      include: {
        user: { select: { name: true, email: true, id: true } },
        address: { include: { locality: true } },
        items: {
          include: {
            product: true,
            Size: true,
            orderExtras: { include: { extra: true } },
            HalfHalf: { include: { firstHalf: true, secondHalf: true } },
          },
        },
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    return NextResponse.json(orders, { status: 200 });
  } catch (error) {
    console.error("Erro ao buscar pedidos do dia:", error);
    return NextResponse.json(
      { error: "Erro ao buscar pedidos do dia." },
      { status: 500 }
    );
  }
}
