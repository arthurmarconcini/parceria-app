export default function currencyFormat(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

export function formatBRL(value: number | undefined | null): string {
  if (value === null || value === undefined) {
    return "";
  }
  const numericValue = typeof value === "string" ? parseFloat(value) : value;

  if (isNaN(numericValue)) {
    return "";
  }

  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(numericValue);
}

export function parseBRL(value: string): number | null {
  if (!value) return null;

  const cleaned = value.replace(/[^\d,]/g, "").replace(",", ".");

  if (cleaned === "") return null;

  const parsed = parseFloat(cleaned);

  return isNaN(parsed) ? null : parsed;
}
