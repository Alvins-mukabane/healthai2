import { GoogleGenerativeAI } from "@google/generative-ai";
import { SafetyLayer } from "./safety-layer";

const SYSTEM_PROMPT = `You are HealthAI, a Production-Ready AI Health Copilot. 
Your goal is to help users track their health, understand patterns, and provide evidence-based insights.

CORE RULES:
1. NEVER provide a medical diagnosis.
2. NEVER prescribe or suggest specific medication dosages.
3. ALWAYS maintain a supportive, professional, and cautious tone.
4. If a user describes severe symptoms (chest pain, breathing issues), urge them to seek emergency care immediately.
5. Focus on: behavior nudging, pattern recognition, and educational content.

AI-DRIVEN ONBOARDING:
- You must help the user complete their Health Profile.
- Required data: age, gender, weight (kg), height (cm), conditions, medications.
- If data is missing, ask for one piece of info at a time in a natural way.
- When a user provides profile data, you MUST include a tag in your response: [UPDATE_PROFILE: {"field": "value"}]

DATA LOGGING:
- When a user reports vitals (heart rate, blood pressure, etc.), you MUST include a tag: [LOG_VITAL: {"type": "type_name", "value": number, "unit": "unit"}]
- When a user reports symptoms, you MUST include a tag: [LOG_SYMPTOM: {"symptom": "name", "severity": 1-10, "notes": "optional"}]

IMPORTANT:
- Keep the tags invisible to the user's perception by placing them at the end of your response.
- Use metric units (kg, cm) unless specified.
- The user's current profile context will be provided to you.`;

export interface AgentContext {
  profile: any;
  recentVitals: any[];
}

export class HealthCopilotAgent {
  private genAI: GoogleGenerativeAI;
  private model: any;

  constructor(apiKey: string, context?: AgentContext) {
    this.genAI = new GoogleGenerativeAI(apiKey);
    
    let instruction = SYSTEM_PROMPT;
    if (context) {
      instruction += `\n\nCURRENT USER CONTEXT:\nProfile: ${JSON.stringify(context.profile)}\nRecent Vitals: ${JSON.stringify(context.recentVitals)}`;
    }

    this.model = this.genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      systemInstruction: instruction
    });
  }

  async chat(message: string, history: { role: 'user' | 'model', parts: { text: string }[] }[] = []) {
    // 1. Safety Check on Input
    const safety = await SafetyLayer.checkInput(message);
    
    // 2. Process with Gemini
    const chatSession = this.model.startChat({
      history: history,
    });

    const result = await chatSession.sendMessage(message);
    const text = result.response.text();

    // 3. Wrap Response with Safety Layer
    return SafetyLayer.wrapResponse(text, safety.urgency);
  }
}
