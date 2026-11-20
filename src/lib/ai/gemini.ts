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
        parts: [{ text: `Pesan user saat onboarding: "${userText}"` }],
      },
    ],
    config: {
      systemInstruction: `Ekstrak data profil kesehatan user dari pesan berbahasa Indonesia.
Data wajib agar is_complete = true: gender ('male' atau 'female'), age (angka tahun), height_cm (angka cm), current_weight_kg (angka kg).
Jika target_weight_kg tidak disebut, isi sama dengan current_weight_kg.
Tentukan goal: 'lose_weight' (jika ingin turun/diet/kurus atau target_weight < current_weight), 'gain_muscle' (jika ingin naik/bulking/otot), atau 'maintain' (jaga berat/hidup sehat).
Jika ada data wajib yang kurang, set is_complete = false dan tulis missing_fields_prompt yang ramah & singkat dalam Bahasa Indonesia untuk menanyakan data yang belum lengkap.`,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          is_complete: { type: Type.BOOLEAN },
          name: { type: Type.STRING },
          gender: { type: Type.STRING, enum: ["male", "female"] },
          age: { type: Type.NUMBER },
          height_cm: { type: Type.NUMBER },
          current_weight_kg: { type: Type.NUMBER },
          target_weight_kg: { type: Type.NUMBER },
          goal: {
            type: Type.STRING,
            enum: ["lose_weight", "maintain", "gain_muscle"],
          },
          missing_fields_prompt: { type: Type.STRING },
        },
        required: ["is_complete", "goal", "missing_fields_prompt"],
      },
    },
  });

  return JSON.parse(response.text!) as ParsedOnboardingProfile;
}

export async function analyzeMealWithGemini(params: {
  text?: string | null;
  imageBase64?: string | null;
  imageMimeType?: string | null;
  lastFoodLog?: FoodLog | null;
}): Promise<GeminiMealAnalysis> {
  const ai = getGeminiClient();
  const { text, imageBase64, imageMimeType, lastFoodLog } = params;

  const parts: Array<
    { text: string } | { inlineData: { data: string; mimeType: string } }
  > = [];

  if (imageBase64 && imageMimeType) {
    parts.push({
      inlineData: {
        data: imageBase64,
        mimeType: imageMimeType,
      },
    });
  }

  let contextPrompt = "";
  if (lastFoodLog && !imageBase64 && text) {
    contextPrompt = `Konteks log makanan terakhir user hari ini (gunakan HANYA jika pesan user terlihat seperti koreksi/revisi atas makanan ini, misalnya "nasinya setengah aja", "tanpa kerupuk", "ganti ayam dada"):
- Nama Hidangan: ${lastFoodLog.meal_summary}
- Komponen Sebelumnya: ${JSON.stringify(lastFoodLog.items)}
\n`;
  }

  parts.push({
    text: `${contextPrompt}Input user: ${text ? `"${text}"` : "(Hanya mengirim foto makanan tanpa teks)"}`,
  });

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: [{ role: "user", parts }],
    config: {
      systemInstruction: `Kamu adalah Ahli Gizi AI Sehatia yang mengkhususkan diri pada makanan dan minuman khas Indonesia (masakan rumahan, warteg, nasi padang, jajanan kaki lima, kopi kekinian, hingga produk kemasan).

ATURAN ANALISIS:
1. Gunakan referensi nilai gizi Tabel Komposisi Pangan Indonesia (TKPI) dan ukuran porsi lazim di Indonesia (1 centong nasi = 100g, 1 porsi nasi piring standar = 150g, 1 sdm minyak/sambal berminyak = ~95 kkal).
2. Pecah makanan menjadi komponen terpisah (misal: Nasi Putih, Ayam Goreng, Sambal, Lalapan) agar mudah dikoreksi user.
3. Perhitungkan hidden calories seperti minyak goreng, santan, gula dalam minuman kopi/teh/boba. Jika user menulis "less sugar" atau "tanpa nasi", ikuti teks user sebagai prioritas utama.
4. Jika tidak ada foto baru dan teks user merupakan koreksi terhadap log makanan terakhir di konteks, set is_revision_of_last_log = true dan hitung ulang komposisi yang sudah direvisi.
5. Jika input sama sekali bukan makanan/minuman maupun revisi makan (misal hanya sapaan "halo" atau pertanyaan acak), set is_food_or_drink = false dan berikan panduan singkat ramah pada short_feedback_id.`,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          is_food_or_drink: { type: Type.BOOLEAN },
          is_revision_of_last_log: { type: Type.BOOLEAN },
          meal_type: {
            type: Type.STRING,
            enum: ["breakfast", "lunch", "dinner", "snack"],
          },
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
            required: ["calories", "protein_g", "carbs_g", "fat_g", "sugar_g"],
          },
          ai_confidence: {
            type: Type.STRING,
            enum: ["high", "medium", "low"],
          },
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

  return JSON.parse(response.text!) as GeminiMealAnalysis;
}
