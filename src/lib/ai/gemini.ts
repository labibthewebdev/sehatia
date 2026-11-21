import { GoogleGenAI, Type } from "@google/genai";
import { FoodLog, GeminiMealAnalysis, GoalType } from "@/types/sehatia";

function getGeminiClient() {
  return new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
}

export interface ParsedOnboardingProfile {
  is_complete: boolean;
  name?: string;
  gender?: "male" | "female";
  age?: number;
  height_cm?: number;
  current_weight_kg?: number;
  target_weight_kg?: number;
  goal: GoalType;
  missing_fields_prompt: string;
}

export async function parseOnboardingReply(
  userText: string
): Promise<ParsedOnboardingProfile> {
  const ai = getGeminiClient();

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: [
      {
        role: "user",
        parts: [
          {
            text: `Ekstrak data profil kesehatan pengguna dari pesan bahasa Indonesia ini: "${userText}".
Field wajib: gender ('male' untuk pria/laki-laki/cowo, 'female' untuk wanita/perempuan/cewe), age (tahun), height_cm (cm), current_weight_kg (kg).
Field opsional: name, target_weight_kg, goal ('lose_weight' jika mau turun BB/diet, 'gain_muscle' jika naik BB/bulking/otot, selain itu 'maintain').
Jika salah satu dari 4 field wajib belum jelas, set is_complete = false dan tulis missing_fields_prompt yang ramah dalam Bahasa Indonesia untuk menanyakan kekurangan datanya.`,
          },
        ],
      },
    ],
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          is_complete: { type: Type.BOOLEAN },
          name: { type: Type.STRING },
          gender: { type: Type.STRING },
          age: { type: Type.INTEGER },
          height_cm: { type: Type.NUMBER },
          current_weight_kg: { type: Type.NUMBER },
          target_weight_kg: { type: Type.NUMBER },
          goal: { type: Type.STRING },
          missing_fields_prompt: { type: Type.STRING },
        },
        required: ["is_complete", "goal", "missing_fields_prompt"],
      },
    },
  });

  const parsed = JSON.parse(response.text || "{}") as ParsedOnboardingProfile;
  const hasAllRequired = Boolean(
    (parsed.gender === "male" || parsed.gender === "female") &&
      parsed.age &&
      parsed.height_cm &&
      parsed.current_weight_kg
  );

  return {
    ...parsed,
    is_complete: hasAllRequired,
    goal:
      parsed.goal === "gain_muscle" || parsed.goal === "maintain"
        ? parsed.goal
        : "lose_weight",
  };
}

export async function analyzeMealWithGemini(params: {
  text?: string;
  imageBase64?: string;
  imageMimeType?: string;
  lastMealLog?: FoodLog | null;
}): Promise<GeminiMealAnalysis> {
  const ai = getGeminiClient();

  const lastLogContext = params.lastMealLog
    ? `Log makanan terakhir user hari ini: "${params.lastMealLog.meal_summary}" (${params.lastMealLog.total_calories} kkal, rincian: ${JSON.stringify(params.lastMealLog.items)}). Jika pesan user saat ini adalah koreksi atas log tersebut (contoh: "nasinya setengah aja", "ayamnya dada tanpa kulit", "es tehnya tawar"), set is_revision_of_last_log = true dan hitung ulang seluruh komponennya.`
    : `Tidak ada log makanan sebelumnya hari ini, maka is_revision_of_last_log = false.`;

  const prompt = `Kamu adalah ahli gizi Indonesia (standar TKPI Kemenkes RI) untuk aplikasi Sehatia.
Tugas: Analisis makanan/minuman dari foto dan/atau teks pengguna: "${params.text || "(Foto makanan tanpa teks)"}".
${lastLogContext}

Aturan:
1. Jika input sama sekali bukan makanan/minuman dan bukan koreksi log terakhir (misal sapaan "halo", "tes", "makasih"), set is_food_or_drink = false dan isi short_feedback_id dengan balasan ramah yang mengarahkan user mengirim foto atau nama makanan.
2. Pecah setiap komponen hidangan (misal nasi putih, ayam goreng, sambal, es teh manis) beserta estimasi gram/porsinya.
3. Hitung kalori (kkal), protein (g), karbohidrat (g), lemak (g), dan gula (g) secara realistis sesuai porsi Indonesia.
4. Tulis short_feedback_id (maksimal 1-2 kalimat) berisi insight gizi singkat yang suportif dalam Bahasa Indonesia.`;

  const parts: Array<Record<string, unknown>> = [{ text: prompt }];
  if (params.imageBase64 && params.imageMimeType) {
    parts.push({
      inlineData: {
        data: params.imageBase64,
        mimeType: params.imageMimeType,
      },
    });
  }

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: [{ role: "user", parts }],
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          is_food_or_drink: { type: Type.BOOLEAN },
          is_revision_of_last_log: { type: Type.BOOLEAN },
          meal_type: { type: Type.STRING },
          meal_summary: { type: Type.STRING },
          items: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                estimated_portion: { type: Type.STRING },
                calories: { type: Type.NUMBER },
                protein_g: { type: Type.NUMBER },
                carbs_g: { type: Type.NUMBER },
                fat_g: { type: Type.NUMBER },
                sugar_g: { type: Type.NUMBER },
              },
              required: [
                "name",
                "estimated_portion",
                "calories",
                "protein_g",
                "carbs_g",
                "fat_g",
                "sugar_g",
              ],
            },
          },
          totals: {
            type: Type.OBJECT,
            properties: {
              calories: { type: Type.NUMBER },
              protein_g: { type: Type.NUMBER },
              carbs_g: { type: Type.NUMBER },
              fat_g: { type: Type.NUMBER },
              sugar_g: { type: Type.NUMBER },
            },
            required: [
              "calories",
              "protein_g",
              "carbs_g",
              "fat_g",
              "sugar_g",
            ],
          },
          ai_confidence: { type: Type.STRING },
          short_feedback_id: { type: Type.STRING },
        },
        required: [
          "is_food_or_drink",
          "is_revision_of_last_log",
          "meal_type",
          "meal_summary",
          "items",
          "totals",
          "ai_confidence",
          "short_feedback_id",
        ],
      },
    },
  });

  return JSON.parse(response.text || "{}") as GeminiMealAnalysis;
}
