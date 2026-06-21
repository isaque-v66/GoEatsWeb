import { MealType } from "../constants/itemValues.constants"
import { getAvailabilityLabel } from "./mealCutoff.rules"
 
/**
 * Adicionar um item ao carrinho NUNCA deve ser bloqueado pelo horário —
 * a regra de corte só decide QUAL DATA pode ser escolhida para o pedido
 * (isso é responsabilidade do calendário no OrderReviewDialog, via
 * isDateAvailableForMeal). Aqui, sempre existe alguma data futura válida
 * (amanhã, ou depois do fim de semana), então o card nunca fica travado.
 */
export function isMealAvailable(meal: MealType): boolean {
  return true
}
 
/**
 * Texto informativo exibido no card, abaixo do nome do item — explica para
 * qual dia o pedido pode ser feito a partir de agora, sem bloquear nada.
 * Mantido o nome para não quebrar os imports existentes no DashboardContent.
 */
export function getRemainingTime(meal: MealType): string {
  return getAvailabilityLabel(meal)
}
 