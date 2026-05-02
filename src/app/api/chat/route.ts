import { NextResponse } from 'next/server';
import { HealthCopilotAgent } from '@/lib/agents/health-copilot';
import { getHealthProfile, getRecentVitals, updateHealthProfile, logVital, logSymptom } from '@/lib/firebase/actions';

export async function POST(req: Request) {
  try {
    const { message, history, userId } = await req.json();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'AI API Key not configured' }, { status: 500 });
    }

    // 1. Fetch Context from Firestore
    const profile = await getHealthProfile(userId);
    const recentVitals = await getRecentVitals(userId);

    // 2. Initialize Agent with Context
    const agent = new HealthCopilotAgent(apiKey, { profile, recentVitals });
    const fullResponse = await agent.chat(message, history);

    // 3. Parse and Execute Tags
    let cleanResponse = fullResponse;
    const tagRegex = /\[(UPDATE_PROFILE|LOG_VITAL|LOG_SYMPTOM): (\{.*?\})\]/g;
    let match;

    while ((match = tagRegex.exec(fullResponse)) !== null) {
      const [fullMatch, action, payloadStr] = match;
      try {
        const payload = JSON.parse(payloadStr);
        
        if (action === 'UPDATE_PROFILE') {
          await updateHealthProfile(userId, payload);
        } else if (action === 'LOG_VITAL') {
          await logVital(userId, payload);
        } else if (action === 'LOG_SYMPTOM') {
          await logSymptom(userId, payload);
        }
        
        // Remove tag from response shown to user
        cleanResponse = cleanResponse.replace(fullMatch, '').trim();
      } catch (e) {
        console.error(`Failed to parse AI tag payload: ${payloadStr}`, e);
      }
    }

    return NextResponse.json({ response: cleanResponse });
  } catch (error: any) {
    console.error('Chat API Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
