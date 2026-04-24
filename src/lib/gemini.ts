import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY as string });

export const nutritionModel = "gemini-3.1-pro-preview";
export const visionModel = "gemini-3.1-pro-preview"; // Or flash if preferred for speed

export async function analyzeFoodImage(base64Image: string) {
  const response = await ai.models.generateContent({
    model: visionModel,
    contents: [
      {
        parts: [
          { inlineData: { data: base64Image, mimeType: "image/jpeg" } },
          { text: "Analyze this meal. Provide a nutrition breakdown (calories, protein, carbs, fats), a health score (1-100), ingredient insights, warnings for unhealthy components, and healthier alternatives. Respond in JSON format." }
        ]
      }
    ],
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          foodName: { type: Type.STRING },
          nutrition: {
            type: Type.OBJECT,
            properties: {
              calories: { type: Type.NUMBER },
              protein: { type: Type.NUMBER },
              carbs: { type: Type.NUMBER },
              fats: { type: Type.NUMBER }
            },
            required: ["calories", "protein", "carbs", "fats"]
          },
          healthScore: { type: Type.NUMBER },
          ingredients: { type: Type.ARRAY, items: { type: Type.STRING } },
          warnings: { type: Type.ARRAY, items: { type: Type.STRING } },
          healthierAlternatives: { type: Type.ARRAY, items: { type: Type.STRING } }
        },
        required: ["foodName", "nutrition", "healthScore", "ingredients", "warnings", "healthierAlternatives"]
      }
    }
  });

  return JSON.parse(response.text || "{}");
}

export async function getMealRecommendations(userProfile: any, context: string) {
  const prompt = `Based on the following user profile: ${JSON.stringify(userProfile)}. 
  Context: ${context}.
  Suggest 3 healthier meal options or snacks. Include food name, estimated cost (under ${userProfile.budgetLimit || 100}), preparation time, and why it's a good choice. Respond in JSON format.`;

  const response = await ai.models.generateContent({
    model: nutritionModel,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            cost: { type: Type.NUMBER },
            prepTime: { type: Type.STRING },
            reason: { type: Type.STRING }
          },
          required: ["name", "cost", "prepTime", "reason"]
        }
      }
    }
  });

  return JSON.parse(response.text || "[]");
}

export async function getHabitNudge(history: any[]) {
  const prompt = `Review the following meal history and habits: ${JSON.stringify(history)}. 
  Identify 1-2 unhealthy patterns (e.g., meal skipping, late night high-calorie intake).
  Provide a friendly, proactive nudge and 2 quick healthy suggestions to counter this pattern.
  Respond in JSON format.`;

  const response = await ai.models.generateContent({
    model: nutritionModel,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          pattern: { type: Type.STRING },
          nudge: { type: Type.STRING },
          suggestions: { type: Type.ARRAY, items: { type: Type.STRING } }
        },
        required: ["pattern", "nudge", "suggestions"]
      }
    }
  });

  return JSON.parse(response.text || "{}");
}
