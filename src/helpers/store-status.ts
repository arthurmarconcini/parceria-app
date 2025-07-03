import { db } from "@/lib/prisma";

const weekDays = [
  "Domingo",
  "Segunda",
  "Terça",
  "Quarta",
  "Quinta",
  "Sexta",
  "Sábado",
];

export async function getStoreStatus() {
  const settings = await db.storeSettings.findFirst();
  if (settings?.isTemporarilyClosed) {
    return {
      isOpen: false,
      message: "Estamos temporariamente fechados. Voltamos em breve!",
    };
  }

  const operatingHours = await db.operatingHours.findMany({
    orderBy: { dayOfWeek: "asc" },
  });
  if (operatingHours.length === 0) {
    // Se não houver horário configurado, assume que está aberto
    return { isOpen: true, message: "" };
  }

  const now = new Date(
    new Date().toLocaleString("en-US", { timeZone: "America/Sao_Paulo" })
  );
  const currentDay = now.getDay(); // 0 = Domingo, 1 = Segunda, etc.
  const currentTime = `${String(now.getHours()).padStart(2, "0")}:${String(
    now.getMinutes()
  ).padStart(2, "0")}`;

  const todayHours = operatingHours.find((h) => h.dayOfWeek === currentDay);

  if (todayHours?.isOpen && todayHours.openTime && todayHours.closeTime) {
    if (
      currentTime >= todayHours.openTime &&
      currentTime < todayHours.closeTime
    ) {
      return { isOpen: true, message: `Aberto até as ${todayHours.closeTime}` };
    }
  }

  // Se está fechado, encontrar o próximo dia/horário de abertura
  let nextOpenDay = null;
  for (let i = 1; i <= 7; i++) {
    const nextDayIndex = (currentDay + i) % 7;
    const nextDayHours = operatingHours.find(
      (h) => h.dayOfWeek === nextDayIndex
    );
    if (nextDayHours?.isOpen && nextDayHours.openTime) {
      const dayName = i === 1 ? "Amanhã" : `na ${weekDays[nextDayIndex]}`;
      nextOpenDay = { day: dayName, time: nextDayHours.openTime };
      break;
    }
  }

  const message = nextOpenDay
    ? `Estamos fechados. Abrimos ${nextOpenDay.day} às ${nextOpenDay.time}.`
    : "Estamos fechados no momento.";

  return { isOpen: false, message };
}
