import {
  addDays,
  startOfDay,
  isSameDay,
  isAfter,
  isBefore,
  nextSaturday,
  nextSunday,
} from "date-fns"
 

export type MealTypeValue =
  | "DESJEJUM"
  | "ALMOCO"
  | "CAFE_TARDE"
  | "JANTAR"
  | "CEIA"
  | "LANCHE"
  | "BEBIDAS"
  | "CAFE_NOTURNO"
 

type MealTypeInput = MealTypeValue | { toString(): string }
 
function normalizeMealType(meal: MealTypeInput): MealTypeValue {
  return String(meal) as MealTypeValue
}
 
// ── Grupos de corte ──
// A: precisa ser pedido no dia anterior, até 14:30 (nunca disponível p/ hoje)
// B: pode ser pedido no mesmo dia, até 08:00
// C: pode ser pedido no mesmo dia, até 09:00
type CutoffGroup = "A" | "B" | "C"
 
const MEAL_GROUP: Record<MealTypeValue, CutoffGroup> = {
  DESJEJUM: "A",
  BEBIDAS: "A",
  ALMOCO: "B",
  CAFE_TARDE: "B",
  JANTAR: "C",
  CEIA: "C",
  LANCHE: "C",
  CAFE_NOTURNO: "C",
}
 
const GROUP_CUTOFF_TIME: Record<CutoffGroup, { hour: number; minute: number }> = {
  A: { hour: 14, minute: 30 },
  B: { hour: 8, minute: 0 },
  C: { hour: 9, minute: 0 },
}
 
const WEEKEND_CUTOFF = { hour: 14, minute: 30 } // sempre sexta 14:30
 
function setTime(date: Date, hour: number, minute: number) {
  const d = new Date(date)
  d.setHours(hour, minute, 0, 0)
  return d
}
 
// Identifica o sábado e domingo "relevantes" para a checagem de corte:
// - Se hoje é dia de semana: o PRÓXIMO sábado/domingo (ainda não chegou).
// - Se hoje já é sábado ou domingo: o sábado/domingo DESTA semana
//   (o que já começou) — para que a regra continue bloqueando o resto do
//   fim de semana, em vez de desligar a checagem assim que ele começa.
function getRelevantWeekend(now: Date): { saturday: Date; sunday: Date } {
  const day = now.getDay()
 
  if (day === 6) {
    
    const saturday = startOfDay(now)
    const sunday = addDays(saturday, 1)
    return { saturday, sunday }
  }
 
  if (day === 0) {
    
    const sunday = startOfDay(now)
    const saturday = addDays(sunday, -1)
    return { saturday, sunday }
  }
 
  const saturday = startOfDay(nextSaturday(now))
  const sunday = startOfDay(nextSunday(now))
  return { saturday, sunday }
}
 
// A sexta-feira imediatamente anterior a um determinado sábado
function fridayBefore(saturday: Date): Date {
  return addDays(saturday, -1)
}
 
/**
 * Verifica se `targetDate` (a data para a qual o item seria pedido) está
 * dentro da janela de corte "fim de semana desta semana": só pode ser
 * definida até sexta 14:30 da semana corrente.
 */
function isThisWeekendDate(now: Date, targetDate: Date): boolean {
  const range = getRelevantWeekend(now)
  return isSameDay(targetDate, range.saturday) || isSameDay(targetDate, range.sunday)
}
 
/**
 * Retorna true se `targetDate` ainda pode ser escolhida como data do pedido
 * para o `meal` informado, considerando o momento atual `now`.
 */
export function isDateAvailableForMeal(rawMeal: MealTypeInput, targetDate: Date, now: Date = new Date()): boolean {
  const meal = normalizeMealType(rawMeal)
  const target = startOfDay(targetDate)
  const today = startOfDay(now)
 
  
  if (isBefore(target, today)) return false
 
  // Regra do fim de semana desta semana sobrepõe tudo: só até sexta 14:30
  if (isThisWeekendDate(now, target)) {
    const range = getRelevantWeekend(now)
    const cutoff = setTime(fridayBefore(range.saturday), WEEKEND_CUTOFF.hour, WEEKEND_CUTOFF.minute)
    return !isAfter(now, cutoff)
  }
 
  const group = MEAL_GROUP[meal]
 
  if (group === "A") {
    // Sempre precisa ser pedido no dia anterior até 14:30 — nunca disponível
    
    if (isSameDay(target, today)) return false
 
    const cutoff = setTime(addDays(target, -1), GROUP_CUTOFF_TIME.A.hour, GROUP_CUTOFF_TIME.A.minute)
    return !isAfter(now, cutoff)
  }
 
  // Grupos B e C: dias futuros (amanhã em diante) sempre disponíveis;
  // hoje só disponível antes do horário de corte.
  if (!isSameDay(target, today)) return true
 
  const cutoff = setTime(today, GROUP_CUTOFF_TIME[group].hour, GROUP_CUTOFF_TIME[group].minute)
  return !isAfter(now, cutoff)
}
 
/**
 * Retorna a primeira data disponível para pedir o `meal`, a partir de agora.
 * Útil para pré-selecionar o calendário ou decidir o texto do card.
 */
export function getNextAvailableDate(rawMeal: MealTypeInput, now: Date = new Date()): Date {
  const meal = normalizeMealType(rawMeal)
  let candidate = startOfDay(now)
  // Busca incrementalmente — o horizonte de checagem é pequeno (poucos dias)
  for (let i = 0; i < 14; i++) {
    if (isDateAvailableForMeal(meal, candidate, now)) return candidate
    candidate = addDays(candidate, 1)
  }
  return candidate
}
 

export function getAvailabilityLabel(rawMeal: MealTypeInput, now: Date = new Date()): string {
  const meal = normalizeMealType(rawMeal)
  const today = startOfDay(now)
  const group = MEAL_GROUP[meal]
 
  
  if (isThisWeekendDate(now, today)) {
    return "Indisponível — pedidos de fim de semana fecham sexta às 14:30"
  }
 
  if (group === "A") {
    const cutoffLabel = "14:30"
    // Grupo A nunca permite hoje; o card deve sempre apontar para amanhã.
    return `Peça até ${cutoffLabel} de hoje para amanhã`
  }
 
  // Grupos B e C: hoje pode estar disponível ou não, dependendo do horário
  const cutoffTime = GROUP_CUTOFF_TIME[group]
  const cutoff = setTime(today, cutoffTime.hour, cutoffTime.minute)
  const cutoffLabel = `${String(cutoffTime.hour).padStart(2, "0")}:${String(cutoffTime.minute).padStart(2, "0")}`
 
  if (!isAfter(now, cutoff)) {
    return `Pedido para hoje disponível até às ${cutoffLabel}`
  }
 
  return `Item indisponível para hoje. Peça para amanhã`
}
 
/**
 * Função usada pelo Calendar do OrderReviewDialog para desabilitar datas
 * que não podem ser escolhidas para este item específico.
 */
export function buildDateDisabler(rawMeal: MealTypeInput, now: Date = new Date()) {
  const meal = normalizeMealType(rawMeal)
  return (date: Date) => !isDateAvailableForMeal(meal, date, now)
}