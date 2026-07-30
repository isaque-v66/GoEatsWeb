import { MealType } from "../constants/itemValues.constants"
import { getAvailabilityLabel } from "./mealCutoff.rules"
 

export function isMealAvailable(meal: MealType): boolean {
  return true
}
 
/**
 * Texto informativo exibido no card, abaixo do nome do item
 */
export function getRemainingTime(meal: MealType): string {
  return getAvailabilityLabel(meal)
}
 