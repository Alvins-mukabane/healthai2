import { GoogleGenAI } from "@google/genai";
import { SPECIALIST_AGENTS } from "@/lib/agents";

// Ensure AI Studio environment key is used.
// Note: In local dev, configure .env.
export const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function chatWithHealthCopilot(
  message: string,
  history: { role: "user" | "model"; parts: any[] }[],
  userContext: string,
  agentId: string = 'Symptom',
  imageBase64?: string,
  imageMimeType?: string
) {
  try {
    const agent = (SPECIALIST_AGENTS as any)[agentId] || SPECIALIST_AGENTS.Symptom;
    const systemInstruction = agent.systemPrompt;

    let userParts: any[] = [{ text: message }];
    
    if (imageBase64 && imageMimeType) {
      userParts.unshift({
        inlineData: {
          mimeType: imageMimeType,
          data: imageBase64.split(',')[1] || imageBase64 // handle data url prefix if present
        }
      });
    }

    const contents = [
      {
        role: "user",
        parts: [{ text: `SYSTEM CONTEXT regarding user (Use this to inform your answers, but do not explicitly say you are reading it):\n${userContext}` }]
      },
      {
        role: "model",
        parts: [{ text: "Understood. I have securely processed the user's health context." }]
      },
      ...history,
      {
        role: "user",
        parts: userParts
      }
    ] as any;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-pro", // better for reasoning
      contents,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.2,
        tools: [{ googleSearch: {} }],
        toolConfig: { includeServerSideToolInvocations: true }
      },
    });

    return response.text;
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("Failed to communicate with Health Copilot.");
  }
}

