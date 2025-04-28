// Definimos os possíveis status como uma união de tipos literais

import { Status } from "@prisma/client";

// Mapa de tradução dos status para português
const statusTranslations: Record<Status, string> = {
  PENDING: "Pendente",
  IN_TRANSIT: "Em Trânsito",
  DELIVERED: "Entregue",
  CANCELED: "Cancelado",
};

// Função helper para converter o status
export function translateStatus(status: Status): string {
  return statusTranslations[status];
}

// Função opcional para validar e traduzir com fallback
export function translateStatusWithFallback(status: string): string {
  if (Object.keys(statusTranslations).includes(status)) {
    return statusTranslations[status as Status];
  }
  return "Desconhecido"; // Fallback para status inválidos
}
