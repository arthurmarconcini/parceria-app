import { db } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  if (!params.id) {
    console.log("No ID provided in the request.");
  }
  console.log("GET request received for order with ID:", params.id);
  const order = await db.order.findUnique({
    where: { id: params.id },
    include: {
      user: { select: { name: true } },
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
  });
  console.log("Order:", order);
  return NextResponse.json(order);
}
