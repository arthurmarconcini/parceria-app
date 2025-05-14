export default function currencyFormat(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

export const formatBRL = (value: number | string): string => {
  const numericValue = typeof value === "string" ? parseFloat(value) : value;
  if (isNaN(numericValue)) return "";
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
  }).format(numericValue);
};

// Desformata um valor BRL para número (ex.: "R$ 12,34" -> 12.34)
export const parseBRL = (value: string): string => {
  // Remove tudo que não é número, vírgula ou ponto
  const cleaned = value.replace(/[^0-9,.]/g, "");
  // Converte para formato numérico (ex.: "12,34" -> "12.34")
  return cleaned.replace(",", ".");
};
