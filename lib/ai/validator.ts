import { AIIntent } from "./router";

// Standard AI response format
export interface AIResponse {
    mode: AIIntent;
    message: string;
    data: AIResponseData | null;
}

// Data for log_habit mode
export interface LogHabitData {
    completions: Array<{
        habitId: string;
        habitName: string;
        matched: boolean;
    }>;
    suggestCreate?: boolean;
    unmatchedActivities?: string[];
}

// Data for insight mode
export interface InsightData {
    metric: string;
    value: string | number;
    trend: "up" | "down" | "stable";
}

// Union type for response data
export type AIResponseData = LogHabitData | InsightData | null;

// Validate response structure
export function validateResponse(response: unknown): AIResponse | null {
    if (!response || typeof response !== "object") {
        return null;
    }

    const r = response as Record<string, unknown>;

    if (
        typeof r.mode !== "string" ||
        typeof r.message !== "string" ||
        !["log_habit", "coach", "insight", "reflection"].includes(r.mode)
    ) {
        return null;
    }

    return {
        mode: r.mode as AIIntent,
        message: r.message,
        data: r.data as AIResponseData || null,
    };
}

// Create a safe response (for error cases)
export function createSafeResponse(mode: AIIntent, message: string): AIResponse {
    return {
        mode,
        message,
        data: null,
    };
}
