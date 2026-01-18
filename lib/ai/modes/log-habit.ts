import { generateJSON } from "../gemini";
import { AIResponse, LogHabitData } from "../validator";

interface Habit {
    id: string;
    name: string;
    color?: string;
}

const LOG_HABIT_SYSTEM_PROMPT = `ROLE: Autonomous Habit Intelligence Engine
You are a habit-aware action planner. Convert messy human narratives into concrete habit logs.

CORE OBJECTIVE:
1. Identify habits from natural language (including compound sentences like "run AND gym")
2. Match to known habits (fuzzy match)
3. Create NEW habits if no match exists (use clean, short names e.g. "Gym Workout")
4. Detect completion status and context

CRITICAL - COMPOUND ACTIONS:
Users often chain actions. "I ran and then did gym" = 2 distinct habits.
Scan for splitters: "and", "then", "after", "also".
ALWAYS extract ALL habits found in the text.

HABIT CREATION RULES:
- If unmatched, create a new habit with a clean Name.
- "did gym exercise" -> "Gym Workout"
- "read book" -> "Reading"

User's known habits: {HABITS}

OUTPUT SCHEMA:
Return 'parsedHabits' array. For EACH detected activity:
- habitName: clean, concise name (e.g. "Gym", "Reading")
- matchedTo: exact name from known habits if matched, or null
- confidence: 0-1`;

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
    userHabits: Habit[],
    conversationHistory: { role: string; content: string }[] = []
): Promise<AIResponse> {
    const habitList = userHabits.length > 0
        ? userHabits.map((h) => h.name).join(", ")
        : "No habits created yet";

    // Format history for the prompt
    const historyText = conversationHistory.length > 0
        ? "RECENT CONVERSATION HISTORY:\n" + conversationHistory.map(m => `${m.role === 'user' ? 'User' : 'AI'}: ${m.content}`).join("\n") + "\n\n"
        : "";

    const systemPrompt = LOG_HABIT_SYSTEM_PROMPT.replace("{HABITS}", habitList) + "\n\n" + historyText;

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
