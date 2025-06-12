import { db } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { OrderExtra, PaymentMethod, Prisma } from "@prisma/client";
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
    address, // Para convidados
    addressId, // 1. Receber o addressId para usuários logados
    total,
    paymentMethod,
    requiresChange,
    changeFor,
    items,
    deliveryFee, // Certifique-se de que deliveryFee está sendo recebido
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

  // 2. Modificar a validação para aceitar 'address' OU 'addressId'
  if ((!address && !addressId) || !total || !paymentMethod) {
    return NextResponse.json(
      {
        error:
          "Campos obrigatórios ausentes: endereço, total ou paymentMethod.",
      },
      { status: 400 }
    );
  }

  if (paymentMethod === "CASH") {
    if (requiresChange === true) {
      if (!changeFor || changeFor <= total + (deliveryFee || 0)) {
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
        gte: new Date(today),
        lt: new Date(new Date(today).setDate(new Date(today).getDate() + 1)),
      },
    },
  });

  const nextOrderNumber = String(ordersToday + 1).padStart(3, "0");
  const orderNumber = `${today}-${nextOrderNumber}`;

  try {
    let finalAddressId: string;

    // 3. Lógica condicional para o endereço
    if (userId && addressId) {
      // Para usuário logado, apenas usamos o ID do endereço existente.
      finalAddressId = addressId;
    } else if (!userId && address) {
      // Para convidado, criamos um novo endereço.
      const createdAddress = await db.address.create({
        data: {
          street: address.street,
          number: address.number,
          city: address.city,
          state: address.state,
          localityId: address.localityId,
          userId: null,
          reference: address.reference || null,
          observation: address.observation || null,
          zipCode: address.zipCode || null,
        },
      });
      finalAddressId = createdAddress.id;
    } else {
      throw new Error("Dados de endereço inválidos.");
    }

    const order = await db.order.create({
      data: {
        orderNumber,
        total,
        deliveryFee, // Incluir a taxa de entrega
        isDelivery: true, // Assumindo que todos os pedidos são para entrega
        paymentMethod: paymentMethod as PaymentMethod,
        requiresChange: paymentMethod === "CASH" ? requiresChange : null,
        changeFor:
          paymentMethod === "CASH" && requiresChange ? changeFor : null,
        addressId: finalAddressId, // 4. Usar o ID do endereço final (novo ou existente)
        isGuestOrder: !userId,
        ...(userId
          ? { userId: userId }
          : { guestName: guestName, guestPhone: guestPhone }),
        items: {
          create: items.map(
            (
              item: Prisma.OrderItemCreateManyOrderInput & {
                halfhalf: true;
                orderExtras: true;
              }
            ) => ({
              productId: item.productId,
              quantity: item.quantity,
              priceAtTime: item.priceAtTime,
              observation: item.observation || null,
              sizeId: item.sizeId || null,
            })
          ),
        },
      },
      include: {
        items: true,
        user: true,
        address: { include: { locality: true } },
      },
    });

    const itemPromises = items.map(
      async (
        item: Prisma.OrderItemGetPayload<{
          include: {
            HalfHalf: true;
            orderExtras: true;
          };
        }>,
        index: number
      ) => {
        const createdOrderItem = order.items[index];

        if (
          item.HalfHalf &&
          item.HalfHalf.firstHalfId &&
          item.HalfHalf.secondHalfId
        ) {
          await db.halfHalf.create({
            data: {
              orderItemId: createdOrderItem.id,
              firstHalfId: item.HalfHalf.firstHalfId,
              secondHalfId: item.HalfHalf.secondHalfId,
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

    return NextResponse.json(completeOrder, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar pedido:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Erro interno do servidor.";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

export async function GET() {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const orders = await db.order.findMany({
      where: {
        createdAt: {
          gte: today,
          lt: tomorrow,
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
