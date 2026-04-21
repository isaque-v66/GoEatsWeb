"use client"

import { useEffect, useState } from "react"
import { MealType } from "../constants/itemValues.constants"


/* TIMER  */


 


const MEAL_SCHEDULE: Record<MealType, { start: number; end: number }> = {
  DESJEJUM: { start: 0, end: 0 },
  ALMOCO: { start: 0, end: 0 },
  CAFE_TARDE: { start: 5, end: 8 },
  JANTAR: { start: 5, end: 9 },
  CEIA: { start: 5, end: 23 },
  CAFE_NOTURNO: { start: 23, end: 5 },
  LANCHE: { start: 0, end: 23 },
  BEBIDAS: { start: 19, end: 14 },
  FIM_SEMANA: { start: 0, end: 23 },
}



//   useEffect(() => {
//     const update = () => setCurrentMeal(getCurrentMeal())
//     update()
//     const interval = setInterval(update, 60_000)
//     return () => clearInterval(interval)
//   }, [])





  export function getCurrentMeal(): MealType | null {
    const hour = new Date().getHours()
    return (
      Object.entries(MEAL_SCHEDULE).find(([_, r]) =>
        r.start < r.end
          ? hour >= r.start && hour < r.end
          : hour >= r.start || hour < r.end
      )?.[0] as MealType | null
    )
  }






  export function getRemainingTime(meal: MealType) {
    const now = new Date()
    let diff = MEAL_SCHEDULE[meal].end - now.getHours()
    if (diff < 0) diff += 24
    return `${diff}h ${59 - now.getMinutes()}m`
  }
