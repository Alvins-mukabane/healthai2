import { GoogleGenAI, Type } from "@google/genai";
import { SPECIALIST_AGENTS } from "./agents";

// Ensure AI Studio environment key is used.
// Note: In local dev, configure .env.
export const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function chatWithHealthCopilot(
  message: string,
  history: { role: "user" | "model"; parts: any[] }[],
  userContext: string,
  agentId: string = 'Symptom',
  imageBase64?: string,
  imageMimeType?: string,
  customPromptOverride?: string
): Promise<{ text?: string, action?: { name: string, args: any } }> {
  try {
    const agent = (SPECIALIST_AGENTS as any)[agentId] || SPECIALIST_AGENTS.Symptom;
    const basePrompt = customPromptOverride || agent.systemPrompt;
    const systemInstruction = basePrompt + "\nIf the user asks to change or customize what metrics are shown on the dashboard (e.g., hide sleep, show heart rate), you MUST call the updateDashboard function to do it for them, and confirm the action.";

    let userParts: any[] = [{ text: message }];
    
    if (imageBase64 && imageMimeType) {
      userParts.unshift({
        inlineData: {
          mimeType: imageMimeType,
          data: imageBase64.split(',')[1] || imageBase64
        }
      });
    }

    const contents = [
      {
        role: "user",
        parts: [{ text: `SYSTEM CONTEXT regarding user:\n${userContext}` }]
      },
      {
        role: "model",
        parts: [{ text: "Understood." }]
      },
      ...history,
      {
        role: "user",
        parts: userParts
      }
    ] as any;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-pro",
      contents,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.2,
        tools: [
          { googleSearch: {} },
          {
            functionDeclarations: [
              {
                name: "updateDashboard",
                description: "Update the dashboard preference to show or hide specific biometric cards.",
                parameters: {
                  type: Type.OBJECT,
                  properties: {
                    showHeartRate: { type: Type.BOOLEAN, description: "Whether to show the Heart Rate card" },
                    showBloodPressure: { type: Type.BOOLEAN, description: "Whether to show the Blood Pressure card" },
                    showSleep: { type: Type.BOOLEAN, description: "Whether to show the Sleep card" }
                  }
                }
              }
            ]
          }
        ]
      },
    });

    if (response.functionCalls && response.functionCalls.length > 0) {
      const call = response.functionCalls[0];
      return { 
        text: response.text || "I have updated your dashboard preferences.", 
        action: { name: call.name, args: call.args } 
      };
    }

    return { text: response.text };
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("Failed to communicate with Health Copilot.");
  }
}

