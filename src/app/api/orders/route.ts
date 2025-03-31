import { db } from "@/app/_lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { OrderExtra, PaymentMethod } from "@prisma/client";

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

  try {
    const order = await db.order.create({
      data: {
        userId,
        addressId,
        total,
        paymentMethod: paymentMethod as PaymentMethod, // Garante que o tipo seja correto
        requiresChange: paymentMethod === "CASH" ? requiresChange : null,
        changeFor:
          paymentMethod === "CASH" && requiresChange ? changeFor : null,
        items: {
          createMany: {
            data: items.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
              priceAtTime: item.priceAtTime,
              observation: item.observation || null, // Garante que observation seja string ou null
            })),
          },
        },
      },
      include: {
        items: true,
      },
    });

    const orderExtrasPromises = items.flatMap((item, index) => {
      const orderItemId = order.items[index].id; // Pega o ID do OrderItem recém-criado
      return item.orderExtras.map((extra: OrderExtra) =>
        db.orderExtra.create({
          data: {
            orderItemId,
            extraId: extra.extraId,
            quantity: extra.quantity,
            priceAtTime: extra.priceAtTime,
          },
        })
      );
    });

    // Executa todas as criações de OrderExtra
    await Promise.all(orderExtrasPromises);

    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar pedido:", error);
    return NextResponse.json(
      { error: "Erro ao criar pedido." },
      { status: 500 }
    );
  }
}
