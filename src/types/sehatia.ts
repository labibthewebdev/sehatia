export type PlanTier = "trial" | "free" | "pro";
export type GoalType = "lose_weight" | "maintain" | "gain_muscle";

export interface UserProfile {
  id: string;
  phone_number: string;
  name: string | null;
  gender: "male" | "female" | null;
  age: number | null;
  height_cm: number | null;
  current_weight_kg: number | null;
  target_weight_kg: number | null;
  goal: GoalType;
  daily_calorie_target: number;
  daily_protein_target_g: number;
  daily_carbs_target_g: number;
  daily_fat_target_g: number;
  plan_tier: PlanTier;
  trial_ends_at: string;
  plan_expires_at: string | null;
  onboarding_step: "ask_profile" | "completed";
  pending_image_url: string | null;
  pending_caption: string | null;
}

export interface FoodItem {
  name: string;
  estimated_portion: string;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  sugar_g: number;
}

export interface FoodLog {
  id: string;
  user_id: string;
  log_date: string;
  meal_type: "breakfast" | "lunch" | "dinner" | "snack";
  raw_input_text: string | null;
  image_url: string | null;
  meal_summary: string;
  items: FoodItem[];
  total_calories: number;
  total_protein_g: number;
  total_carbs_g: number;
  total_fat_g: number;
  total_sugar_g: number;
  ai_confidence: "high" | "medium" | "low";
  short_feedback: string | null;
  created_at: string;
}

export interface GeminiMealAnalysis {
  is_food_or_drink: boolean;
  is_revision_of_last_log: boolean;
  meal_type: "breakfast" | "lunch" | "dinner" | "snack";
  meal_summary: string;
  items: FoodItem[];
  totals: {
    calories: number;
    protein_g: number;
    carbs_g: number;
    fat_g: number;
    sugar_g: number;
  };
  ai_confidence: "high" | "medium" | "low";
  short_feedback_id: string;
}
