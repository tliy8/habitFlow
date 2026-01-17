import { generateText } from "../gemini";
import { AIResponse } from "../validator";

interface CompletionData {
    date: string;
    habitId: string;
    habitName: string;
}

interface HabitStats {
    habitName: string;
    completionRate: number;
    currentStreak: number;
}

const INSIGHT_SYSTEM_PROMPT = `You are a habit data analyst embedded in a habit tracking app.

Given the user's habit completion data, provide ONE actionable insight.

DATA:
{DATA}

RULES:
1. Focus on patterns, not just numbers
2. Be specific and actionable
3. Highlight what's working, not just problems
4. Maximum 2 sentences
5. No emojis
6. Professional tone

Examples of good insights:
- "Your morning habits have 85% completion rate. Consider adding another morning ritual to leverage this strength."
- "Wednesdays show a consistent drop in all habits. Consider scheduling fewer commitments on that day."
- "Your reading habit has improved 15% this week. The consistency is building."`;

export async function handleInsight(
    userMessage: string,
    completions: CompletionData[],
    habitStats: HabitStats[]
): Promise<AIResponse> {
    // Build data summary for the AI
    const dataSummary = buildDataSummary(completions, habitStats);
    const systemPrompt = INSIGHT_SYSTEM_PROMPT.replace("{DATA}", dataSummary);

    try {
        const response = await generateText(userMessage, systemPrompt);

        return {
            mode: "insight",
            message: response.trim(),
            data: null,
        };
    } catch (error) {
        console.error("[Insight] Error:", error);

        // Fallback with basic insight
        const bestHabit = habitStats.reduce((a, b) =>
            a.completionRate > b.completionRate ? a : b, habitStats[0]);

        return {
            mode: "insight",
            message: bestHabit
                ? `Your strongest habit is "${bestHabit.habitName}" at ${Math.round(bestHabit.completionRate)}% completion. Keep building on this momentum.`
                : "Keep tracking your habits. Patterns emerge with consistent data.",
            data: null,
        };
    }
}

function buildDataSummary(completions: CompletionData[], habitStats: HabitStats[]): string {
    const lines: string[] = [];

    // Overall stats
    lines.push(`Total completions this month: ${completions.length}`);

    // Per-habit stats
    for (const stat of habitStats) {
        lines.push(`- ${stat.habitName}: ${Math.round(stat.completionRate)}% completion, ${stat.currentStreak}-day streak`);
    }

    // Day of week patterns
    const dayCompletions = new Map<string, number>();
    for (const c of completions) {
        const day = new Date(c.date).toLocaleDateString("en-US", { weekday: "long" });
        dayCompletions.set(day, (dayCompletions.get(day) || 0) + 1);
    }

    if (dayCompletions.size > 0) {
        lines.push("\nCompletions by day:");
        dayCompletions.forEach((count, day) => {
            lines.push(`- ${day}: ${count}`);
        });
    }

    return lines.join("\n");
}
