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
    guestName,
    guestPhone,
    address,
    total,
    paymentMethod,
    requiresChange,
    changeFor,
    items,
  } = await req.json();

  if (!userId && (!guestName || !guestPhone)) {
    return NextResponse.json(
      {
        error:
          "Identificação do usuário ou dados do convidado são necessários.",
      },
      { status: 400 }
    );
  }

  // Validação dos campos obrigatórios
  if (!address || !total || !paymentMethod) {
    return NextResponse.json(
      {
        error: "Campos obrigatórios ausentes: address, total ou paymentMethod.",
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
    const createdAddress = await db.address.create({
      data: {
        street: address.street,
        number: address.number,
        city: address.city,
        state: address.state,
        localityId: address.localityId,
        userId: userId || null,
      },
    });

    const order = await db.order.create({
      data: {
        ...(userId
          ? { userId: userId }
          : { guestName: guestName, guestPhone: guestPhone }),
        addressId: createdAddress.id,
        total,
        orderNumber,
        isGuestOrder: !userId,
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
          })),
        },
      },

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

    // Lógica para criar HalfHalf e OrderExtras
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
