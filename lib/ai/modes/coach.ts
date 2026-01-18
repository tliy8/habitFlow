import { generateText } from "../gemini";
import { AIResponse } from "../validator";

interface CoachContext {
    habits: Array<{ name: string; completedToday: boolean }>;
    todayCompletedCount: number;
    totalHabits: number;
    longestStreak: number;
}

const COACH_SYSTEM_PROMPT = `You are a professional habit coach embedded in a habit tracking app.

USER CONTEXT:
{CONTEXT}

BEHAVIOR RULES (STRICT):
1. NEVER shame the user
2. NEVER say "it's okay" without actionable guidance
3. NEVER use hype language ("You've got this!", "Amazing!")
4. ALWAYS reference their SPECIFIC habits by name when relevant
5. ALWAYS protect their identity ("You're someone who shows up")
6. ALWAYS end with ONE concrete, specific next action
7. Reframe setbacks as data, not defeat

TONE:
- Calm and confident
- Supportive but direct
- Professional, like a trusted coach
- NO emojis
- NO exclamation marks
- NO "don't worry" or "that's fine"

STRUCTURE YOUR RESPONSE:
1. Acknowledge what they shared (1 sentence)
2. Reframe with context from their habits (1-2 sentences)
3. Protect their identity as a habit builder (1 sentence)
4. Give ONE specific, actionable next step mentioning a specific habit if relevant

Keep response under 80 words. Be direct and specific.`;

export async function handleCoach(
    userMessage: string,
    context?: CoachContext
): Promise<AIResponse> {
    // Build personalized context
    let contextString = "No habit data available.";

    if (context && context.habits.length > 0) {
        const completedHabits = context.habits.filter(h => h.completedToday).map(h => h.name);
        const missedHabits = context.habits.filter(h => !h.completedToday).map(h => h.name);

        contextString = `
Today's Progress: ${context.todayCompletedCount}/${context.totalHabits} habits completed
${completedHabits.length > 0 ? `Completed today: ${completedHabits.join(", ")}` : "No habits completed yet today"}
${missedHabits.length > 0 ? `Not yet done: ${missedHabits.join(", ")}` : ""}
Longest streak: ${context.longestStreak} days
All habits: ${context.habits.map(h => h.name).join(", ")}`;
    }

    const systemPrompt = COACH_SYSTEM_PROMPT.replace("{CONTEXT}", contextString);

    try {
        const response = await generateText(userMessage, systemPrompt);

        return {
            mode: "coach",
            message: response.trim(),
            data: null,
        };
    } catch (error) {
        console.error("[Coach] Error:", error);

        // Personalized fallback if we have context
        if (context && context.habits.length > 0) {
            const nextHabit = context.habits.find(h => !h.completedToday)?.name || context.habits[0].name;
            return {
                mode: "coach",
                message: `Missing a habit doesn't define you. You're someone who shows up. Tomorrow, start with ${nextHabit} first thing - make it small and just begin.`,
                data: null,
            };
        }

        return {
            mode: "coach",
            message: "Missing a habit doesn't change who you are. You're someone who shows up. Tomorrow, pick the smallest version of one habit and just start.",
            data: null,
        };
    }
}

