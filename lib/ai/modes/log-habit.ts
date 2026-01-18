import { generateJSON } from "../gemini";
import { AIResponse, LogHabitData } from "../validator";

interface Habit {
    id: string;
    name: string;
    color?: string;
}

const LOG_HABIT_SYSTEM_PROMPT = `You are a friendly habit logging assistant for a habit tracking app.

The user will describe activities they completed. Your job is to:
1. Extract ALL activities/habits they mentioned
2. For each activity, try to match it to their known habit list

Be GENEROUS in matching:
- "ran 5km" → "Morning Run" or "Running"
- "drank water" → "Drink Water" or "Hydration"
- "60 minute HIIT" → "HIIT Training" or "Workout" or "Exercise"
- "read for 30 minutes" → "Reading" or "Read"

User's known habits: {HABITS}

For EACH activity the user mentions, return it in parsedHabits with:
- habitName: the activity as the user described it
- matchedTo: the exact name from known habits if matched, or null if no match
- confidence: how confident you are in the match (0-1)`;

const LOG_HABIT_SCHEMA = `{
  "parsedHabits": [
    { 
      "habitName": "string (what user said)", 
      "matchedTo": "string | null (exact name from known habits, or null)",
      "confidence": number 
    }
  ]
}`;

export async function handleLogHabit(
    userMessage: string,
    userHabits: Habit[]
): Promise<AIResponse> {
    const habitList = userHabits.length > 0
        ? userHabits.map((h) => h.name).join(", ")
        : "No habits created yet";
    const systemPrompt = LOG_HABIT_SYSTEM_PROMPT.replace("{HABITS}", habitList);

    const result = await generateJSON<{
        parsedHabits: Array<{
            habitName: string;
            matchedTo: string | null;
            confidence: number
        }>
    }>(
        userMessage,
        systemPrompt,
        LOG_HABIT_SCHEMA
    );

    if (!result || !result.parsedHabits || result.parsedHabits.length === 0) {
        return {
            mode: "log_habit",
            message: "I didn't catch any activities in that message. Try something like \"I did my morning run\" or \"completed 30 minutes of reading\".",
            data: null,
        };
    }

    // Match parsed habits to actual user habits
    const completions: LogHabitData["completions"] = [];
    const unmatchedActivities: string[] = [];

    for (const parsed of result.parsedHabits) {
        // Try AI's suggested match first, then fallback to fuzzy matching
        let match: Habit | null = null;

        if (parsed.matchedTo) {
            match = userHabits.find(h =>
                h.name.toLowerCase() === parsed.matchedTo!.toLowerCase()
            ) || null;
        }

        // Fallback: try our own fuzzy matching
        if (!match) {
            match = findBestMatch(parsed.habitName, userHabits);
        }

        if (match) {
            completions.push({
                habitId: match.id,
                habitName: match.name,
                matched: true,
            });
        } else {
            unmatchedActivities.push(parsed.habitName);
            completions.push({
                habitId: "",
                habitName: parsed.habitName,
                matched: false,
            });
        }
    }

    const matchedCount = completions.filter((c) => c.matched).length;
    const matchedHabits = completions.filter((c) => c.matched);

    // Build a conversational, encouraging response
    let message = "";

    if (matchedCount > 0) {
        // Celebrate matched habits
        if (matchedCount === 1) {
            message = `Great job completing ${matchedHabits[0].habitName}! That's logged for today.`;
        } else {
            const names = matchedHabits.map(h => h.habitName).join(" and ");
            message = `Awesome! Logged ${names}. You're building momentum.`;
        }
    }

    if (unmatchedActivities.length > 0) {
        // Suggest creating new habits for unmatched activities
        const suggestions = unmatchedActivities.map(a => `"${a}"`).join(", ");

        if (matchedCount > 0) {
            message += `\n\nI noticed you also did ${suggestions}, but ${unmatchedActivities.length === 1 ? "it's" : "they're"} not in your habit list yet. Want to add ${unmatchedActivities.length === 1 ? "it" : "them"} as ${unmatchedActivities.length === 1 ? "a new habit" : "new habits"}?`;
        } else {
            message = `I see you completed ${suggestions}, but ${unmatchedActivities.length === 1 ? "this isn't" : "these aren't"} in your habit list yet.\n\nWould you like to create ${unmatchedActivities.length === 1 ? "a new habit" : "new habits"} for ${unmatchedActivities.length === 1 ? "this" : "these"}? You can add habits from the dashboard.`;
        }
    }

    return {
        mode: "log_habit",
        message,
        data: {
            completions,
            suggestCreate: unmatchedActivities.length > 0,
            unmatchedActivities,
        },
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
