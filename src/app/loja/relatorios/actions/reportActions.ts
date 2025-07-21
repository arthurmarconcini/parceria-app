"use server";

import { PaymentMethod, Prisma, Status } from "@prisma/client";
import { endOfDay, startOfDay } from "date-fns";
import { db } from "@/lib/prisma";

interface IGetReportsParams {
  date?: {
    from?: Date;
    to?: Date;
  };
  status?: string;
  paymentMethod?: string;
  page?: number;
  pageSize?: number;
}

export const getReports = async (params: IGetReportsParams) => {
  const { date, status, paymentMethod, page = 1, pageSize = 10 } = params;

  // Define a data padrão para o dia atual se nenhuma for fornecida.
  const from = date?.from ? startOfDay(date.from) : startOfDay(new Date());
  const to = date?.to ? endOfDay(date.to) : endOfDay(new Date());

  // Constrói a cláusula 'where' para a consulta do Prisma com base nos filtros.
  const where: Prisma.OrderWhereInput = {
    createdAt: {
      gte: from,
      lte: to,
    },
    ...(status && { status: status as Status }),
    ...(paymentMethod && { paymentMethod: paymentMethod as PaymentMethod }),
  };

  // Executa as consultas ao banco de dados em paralelo para otimizar o tempo de resposta.
  const [orders, totalCount, dashboardData] = await Promise.all([
    // Busca os pedidos com paginação.
    db.order.findMany({
      where,
      include: {
        user: true, // Inclui os dados do usuário para exibir o nome do cliente.
      },
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: {
        createdAt: "desc",
      },
    }),
    // Conta o número total de pedidos que correspondem aos filtros.
    db.order.count({ where }),
    // Agrega os dados para o dashboard (total de vendas e contagem de pedidos).
    db.order.aggregate({
      where,
      _sum: {
        total: true,
      },
      _count: {
        id: true,
      },
    }),
  ]);

  return {
    orders,
    pagination: {
      totalCount,
      currentPage: page,
      pageSize,
      totalPages: Math.ceil(totalCount / pageSize),
    },
    dashboard: {
      totalAmount: dashboardData._sum.total || 0,
      totalOrders: dashboardData._count.id || 0,
    },
  };
};

/**
 * Busca todos os pedidos para um determinado intervalo de datas e filtros, sem paginação.
 * Útil para a funcionalidade de impressão.
 * @param params - Os parâmetros de filtro.
 * @returns Uma lista de todos os pedidos que correspondem aos filtros.
 */
export const getAllOrdersForPrint = async (
  params: Omit<IGetReportsParams, "page" | "pageSize">
) => {
  const { date, status, paymentMethod } = params;
  const from = date?.from ? startOfDay(date.from) : startOfDay(new Date());
  const to = date?.to ? endOfDay(date.to) : endOfDay(new Date());

  const where: Prisma.OrderWhereInput = {
    createdAt: {
      gte: from,
      lte: to,
    },
    ...(status && { status: status as Status }),
    ...(paymentMethod && { paymentMethod: paymentMethod as PaymentMethod }),
  };

  const orders = await db.order.findMany({
    where,
    include: {
      user: true,
    },
    orderBy: {
      createdAt: "asc",
    },
  });

  return orders;
};
