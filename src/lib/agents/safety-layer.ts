/**
 * SafetyLayer
 * 
 * Enforces non-diagnostic guardrails and identifies potential medical emergencies.
 */

export interface SafetyCheckResult {
  isSafe: boolean;
  reason?: string;
  urgency: 'low' | 'medium' | 'high';
  disclaimerRequired: boolean;
}

export const MEDICAL_DISCLAIMER = "I am an AI health copilot, not a doctor. This information is for educational purposes only and does not constitute medical advice, diagnosis, or treatment. Always seek the advice of your physician or other qualified health provider with any questions you may have regarding a medical condition.";

export const EMERGENCY_KEYWORDS = [
  'chest pain', 'shortness of breath', 'difficulty breathing', 
  'stroke', 'unconscious', 'severe bleeding', 'suicide', 'self harm'
];

export class SafetyLayer {
  static async checkInput(text: string): Promise<SafetyCheckResult> {
    const lowerText = text.toLowerCase();
    
    // 1. Check for emergency keywords
    const hasEmergency = EMERGENCY_KEYWORDS.some(keyword => lowerText.includes(keyword));
    if (hasEmergency) {
      return {
        isSafe: true, // We allow it but flag high urgency
        urgency: 'high',
        reason: 'Potential medical emergency detected.',
        disclaimerRequired: true
      };
    }

    // 2. Default safe state
    return {
      isSafe: true,
      urgency: 'low',
      disclaimerRequired: true
    };
  }

  static wrapResponse(response: string, urgency: 'low' | 'medium' | 'high'): string {
    let prefix = "";
    if (urgency === 'high') {
      prefix = "🚨 **IMPORTANT: If you are experiencing a medical emergency, please call 911 or your local emergency services immediately.**\n\n";
    }

    return `${prefix}${response}\n\n---\n*${MEDICAL_DISCLAIMER}*`;
  }
}
