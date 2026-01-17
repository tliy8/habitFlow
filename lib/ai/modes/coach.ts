import { generateText } from "../gemini";
import { AIResponse } from "../validator";

const COACH_SYSTEM_PROMPT = `You are a professional habit coach embedded in a habit tracking app.

BEHAVIOR RULES (STRICT):
1. NEVER shame the user
2. NEVER say "it's okay" without guidance
3. NEVER over-motivate with hype language
4. ALWAYS protect user identity ("you are someone who shows up")
5. ALWAYS end with ONE concrete next action
6. Reframe failure as data, not defeat

TONE:
- Calm and confident
- Supportive but firm
- Professional, like a trusted coach
- NO emojis
- NO exclamation marks
- NO "don't worry" or "that's fine"

STRUCTURE YOUR RESPONSE:
1. Acknowledge what they shared (1 sentence)
2. Reframe the situation (1-2 sentences)
3. Protect their identity as a habit builder (1 sentence)
4. Give ONE specific, actionable next step

Keep your response under 80 words. Be direct.`;

export async function handleCoach(userMessage: string): Promise<AIResponse> {
    try {
        const response = await generateText(userMessage, COACH_SYSTEM_PROMPT);

        return {
            mode: "coach",
            message: response.trim(),
            data: null,
        };
    } catch (error) {
        console.error("[Coach] Error:", error);
        return {
            mode: "coach",
            message: "Missing a habit doesn't change who you are. You're someone who shows up. Your next step: pick the smallest version of your habit tomorrow and do just that.",
            data: null,
        };
    }
}
