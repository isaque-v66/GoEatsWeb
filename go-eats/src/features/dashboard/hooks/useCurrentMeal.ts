

// "use client"

// import { useEffect, useState } from "react"
// import { getCurrentMeal } from "../utils/meal.utils"
// import { MealType } from "../constants/itemValues.constants"

// export function useCurrentMeal() {
//   const [currentMeal, setCurrentMeal] = useState<MealType | null>(null)

//   useEffect(() => {
//     function update() {
//       setCurrentMeal(getCurrentMeal())
//     }

//     update()
//     const interval = setInterval(update, 60000)

//     return () => clearInterval(interval)
//   }, [])

//   return currentMeal
// }