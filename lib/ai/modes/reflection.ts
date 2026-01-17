import { generateText } from "../gemini";
import { AIResponse } from "../validator";
import { format } from "date-fns";

interface TodayData {
    completedCount: number;
    totalHabits: number;
    completedHabits: string[];
    missedHabits: string[];
    currentStreak: number;
}

const REFLECTION_SYSTEM_PROMPT = `You are a habit reflection coach providing end-of-day summaries.

Given today's habit data, provide a brief reflection.

TODAY'S DATA:
{DATA}

RULES:
1. Start with what was accomplished (if any)
2. Acknowledge effort, not just results
3. If all habits completed, celebrate briefly
4. If habits missed, frame tomorrow as opportunity
5. End with one thing to focus on tomorrow
6. Maximum 3 sentences
7. No emojis
8. Calm, professional tone

Examples:
- "You completed 3 of 4 habits today, keeping your 5-day streak alive. Morning Run was missed, but your consistency shows commitment. Tomorrow, prioritize that run first thing."
- "Today you hit all 4 habits. This is what building momentum looks like. Tomorrow, maintain this rhythm."`;

export async function handleReflection(
    userMessage: string,
    todayData: TodayData
): Promise<AIResponse> {
    const dataSummary = buildTodayDataSummary(todayData);
    const systemPrompt = REFLECTION_SYSTEM_PROMPT.replace("{DATA}", dataSummary);

    try {
        const response = await generateText(userMessage, systemPrompt);

        return {
            mode: "reflection",
            message: response.trim(),
            data: null,
        };
    } catch (error) {
        console.error("[Reflection] Error:", error);

        // Fallback reflection
        const { completedCount, totalHabits, currentStreak } = todayData;
        const percentage = totalHabits > 0 ? Math.round((completedCount / totalHabits) * 100) : 0;

        let message: string;
        if (percentage === 100) {
            message = `Perfect day. You completed all ${totalHabits} habits. Your ${currentStreak}-day streak continues. Tomorrow, maintain this momentum.`;
        } else if (percentage >= 50) {
            message = `You completed ${completedCount} of ${totalHabits} habits today. Progress over perfection. Tomorrow is another opportunity.`;
        } else {
            message = `Today was quiet on the habit front. That's data, not defeat. Tomorrow, start with just one habit and build from there.`;
        }

        return {
            mode: "reflection",
            message,
            data: null,
        };
    }
}

function buildTodayDataSummary(data: TodayData): string {
    const lines: string[] = [];

    lines.push(`Date: ${format(new Date(), "EEEE, MMMM d")}`);
    lines.push(`Completed: ${data.completedCount}/${data.totalHabits}`);
    lines.push(`Current streak: ${data.currentStreak} days`);

    if (data.completedHabits.length > 0) {
        lines.push(`Completed habits: ${data.completedHabits.join(", ")}`);
    }

    if (data.missedHabits.length > 0) {
        lines.push(`Missed habits: ${data.missedHabits.join(", ")}`);
    }

    return lines.join("\n");
}
