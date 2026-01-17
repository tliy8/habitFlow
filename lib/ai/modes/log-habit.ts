import { generateJSON } from "../gemini";
import { AIResponse, LogHabitData } from "../validator";

interface Habit {
    id: string;
    name: string;
    color?: string;
}

interface ParsedHabit {
    habitName: string;
    matched: boolean;
}

const LOG_HABIT_SYSTEM_PROMPT = `You are a habit logging assistant.

The user will describe activities they completed. Your job is to:
1. Extract the habits they mentioned
2. Match them to their known habit list if possible

Be generous in matching. "ran 5km" matches "Morning Run", "drank water" matches "Drink Water".

Known habits: {HABITS}`;

const LOG_HABIT_SCHEMA = `{
  "parsedHabits": [
    { "habitName": "string", "confidence": number }
  ]
}`;

export async function handleLogHabit(
    userMessage: string,
    userHabits: Habit[]
): Promise<AIResponse> {
    const habitList = userHabits.map((h) => h.name).join(", ");
    const systemPrompt = LOG_HABIT_SYSTEM_PROMPT.replace("{HABITS}", habitList || "None");

    const result = await generateJSON<{ parsedHabits: Array<{ habitName: string; confidence: number }> }>(
        userMessage,
        systemPrompt,
        LOG_HABIT_SCHEMA
    );

    if (!result || !result.parsedHabits || result.parsedHabits.length === 0) {
        return {
            mode: "log_habit",
            message: "I couldn't identify any habits from your message. Try saying something like \"I completed my morning run and read for 30 minutes.\"",
            data: null,
        };
    }

    // Match parsed habits to actual user habits
    const completions: LogHabitData["completions"] = [];

    for (const parsed of result.parsedHabits) {
        const match = findBestMatch(parsed.habitName, userHabits);
        if (match) {
            completions.push({
                habitId: match.id,
                habitName: match.name,
                matched: true,
            });
        } else {
            completions.push({
                habitId: "",
                habitName: parsed.habitName,
                matched: false,
            });
        }
    }

    const matchedCount = completions.filter((c) => c.matched).length;
    const matchedNames = completions
        .filter((c) => c.matched)
        .map((c) => c.habitName)
        .join(", ");

    const message = matchedCount > 0
        ? `Logged: ${matchedNames}. ${matchedCount === completions.length ? "All habits matched." : "Some habits couldn't be matched to your list."}`
        : "None of the habits matched your list. Would you like to create new habits?";

    return {
        mode: "log_habit",
        message,
        data: { completions },
    };
}

// Simple fuzzy matching
function findBestMatch(input: string, habits: Habit[]): Habit | null {
    const inputLower = input.toLowerCase();

    for (const habit of habits) {
        const habitLower = habit.name.toLowerCase();

        // Exact match
        if (habitLower === inputLower) return habit;

        // Contains match
        if (habitLower.includes(inputLower) || inputLower.includes(habitLower)) return habit;

        // Keyword matching
        const inputWords = inputLower.split(/\s+/);
        const habitWords = habitLower.split(/\s+/);
        const commonWords = inputWords.filter((w) => habitWords.some((hw) => hw.includes(w) || w.includes(hw)));
        if (commonWords.length > 0) return habit;
    }

    return null;
}
