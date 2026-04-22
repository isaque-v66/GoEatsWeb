"use client"

import { MealType } from "../constants/itemValues.constants"

function getNow() {
  return new Date()
}

function isFriday(date: Date) {
  return date.getDay() === 5
}

function isWeekend(date: Date) {
  return date.getDay() === 0 || date.getDay() === 6
}

function setTime(date: Date, hours: number, minutes: number) {
  const d = new Date(date)
  d.setHours(hours, minutes, 0, 0)
  return d
}






const MEAL_LIMITS: Record<MealType, { hour: number; minute: number } | null> = {
  DESJEJUM: { hour: 14, minute: 30 }, 
  ALMOCO: { hour: 8, minute: 0 },
  CAFE_TARDE: { hour: 8, minute: 0 },
  JANTAR: { hour: 9, minute: 0 },

  CEIA: { hour: 23, minute: 59 },
  LANCHE: { hour: 23, minute: 59 },
  BEBIDAS: { hour: 23, minute: 59 },
  CAFE_NOTURNO: { hour: 23, minute: 59 },

  FIM_SEMANA: null,
}







export function isMealAvailable(meal: MealType): boolean {
  const now = getNow()

  if (isWeekend(now)) return false

  if (isFriday(now)) {
    return now <= setTime(now, 14, 30)
  }

  // DESJEJUM (regra especial)
  if (meal === MealType.DESJEJUM) {
    const yesterday = new Date(now)
    yesterday.setDate(now.getDate() - 1)

    const limit = setTime(yesterday, 14, 30)
    return now <= limit
  }

  const config = MEAL_LIMITS[meal]

  if (!config) return false

  const limit = setTime(now, config.hour, config.minute)

  return now <= limit
}



export function getRemainingTime(meal: MealType): string {
  const now = getNow()
  let limit: Date

  if (isWeekend(now)) {
    return "Indisponível no fim de semana"
  }

  if (isFriday(now)) {
    limit = setTime(now, 14, 30)
  } else if (meal === MealType.DESJEJUM) {
    const yesterday = new Date(now)
    yesterday.setDate(now.getDate() - 1)

    limit = setTime(yesterday, 14, 30)
  } else {
    const config = MEAL_LIMITS[meal]

    if (!config) return "Indisponível"

    limit = setTime(now, config.hour, config.minute)
  }

  const diff = limit.getTime() - now.getTime()

  if (diff <= 0) return "Encerrado"

  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(minutes / 60)

  return hours > 0
    ? `${hours}h ${minutes % 60}min`
    : `${minutes}min`
}