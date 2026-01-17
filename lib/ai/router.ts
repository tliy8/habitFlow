import { generateJSON } from "./gemini";

export type AIIntent = "log_habit" | "coach" | "insight" | "reflection";

interface RouterResult {
    intent: AIIntent;
    confidence: number;
}

const ROUTER_SYSTEM_PROMPT = `You are an intent classifier for a habit tracking app.

Classify the user's message into exactly ONE intent:

1. log_habit - User describes actions they completed today
   Examples: "I drank water", "did my morning run", "finished reading"

2. coach - User mentions missing, failing, struggling, or feeling bad about habits
   Examples: "I missed my workout", "I've been slacking", "feeling unmotivated"

3. insight - User asks about their patterns, progress, or performance
   Examples: "how am I doing?", "what's my best habit?", "show my stats"

4. reflection - User wants a summary, review, or feedback on their day/week
   Examples: "give me my summary", "how was today?", "end of day review"

Be conservative. If unsure, default to "coach" for emotional content or "insight" for questions.`;

const ROUTER_SCHEMA = `{
  "intent": "log_habit" | "coach" | "insight" | "reflection",
  "confidence": number (0-1)
}`;

export async function routeIntent(userMessage: string): Promise<RouterResult> {
    const result = await generateJSON<RouterResult>(
        userMessage,
        ROUTER_SYSTEM_PROMPT,
        ROUTER_SCHEMA
    );

    if (!result || !isValidIntent(result.intent)) {
        // Default fallback
        return { intent: "coach", confidence: 0.5 };
    }

    return result;
}

function isValidIntent(intent: string): intent is AIIntent {
    return ["log_habit", "coach", "insight", "reflection"].includes(intent);
}
