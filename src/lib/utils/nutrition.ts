import { GoalType } from "@/types/sehatia";

/**
 * Menghitung target kalori & makronutrisi harian menggunakan rumus Mifflin-St Jeor
 * dengan faktor aktivitas ringan-sedang (1.375) yang realistis untuk pekerja harian.
 */
export function calculateDailyTargets(params: {
  gender: "male" | "female";
  age: number;
  height_cm: number;
  current_weight_kg: number;
  goal: GoalType;
}) {
  const { gender, age, height_cm, current_weight_kg, goal } = params;

  const bmr =
    gender === "male"
      ? 10 * current_weight_kg + 6.25 * height_cm - 5 * age + 5
      : 10 * current_weight_kg + 6.25 * height_cm - 5 * age - 161;

  const tdee = bmr * 1.375;

  let targetCalories = Math.round(tdee);
  if (goal === "lose_weight") {
    targetCalories = Math.max(1200, Math.round(tdee - 450));
  } else if (goal === "gain_muscle") {
    targetCalories = Math.round(tdee + 300);
  }

  // Distribusi makro seimbang untuk diet sehat
  const proteinRatio = goal === "lose_weight" ? 0.3 : 0.25;
  const fatRatio = 0.25;
  const carbsRatio = 1 - proteinRatio - fatRatio;

  return {
    daily_calorie_target: targetCalories,
    daily_protein_target_g: Math.round((targetCalories * proteinRatio) / 4),
    daily_carbs_target_g: Math.round((targetCalories * carbsRatio) / 4),
    daily_fat_target_g: Math.round((targetCalories * fatRatio) / 9),
  };
}
