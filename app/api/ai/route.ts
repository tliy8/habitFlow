import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { format } from "date-fns";

import { routeIntent } from "@/lib/ai/router";
import { AIResponse } from "@/lib/ai/validator";
import { handleLogHabit } from "@/lib/ai/modes/log-habit";
import { handleCoach } from "@/lib/ai/modes/coach";
import { handleInsight } from "@/lib/ai/modes/insight";
import { handleReflection } from "@/lib/ai/modes/reflection";

export async function POST(req: NextRequest) {
    try {
        // Auth check
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { message } = await req.json();

        if (!message || typeof message !== "string" || message.trim().length === 0) {
            return NextResponse.json({ error: "Message is required" }, { status: 400 });
        }

        // Get user by email
        const user = await db.user.findUnique({
            where: { email: session.user.email },
            select: { id: true },
        });

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        const userId = user.id;

        // Step 1: Route intent
        const { intent } = await routeIntent(message);

        // Step 2: Fetch user data for context
        const habits = await db.habit.findMany({
            where: { userId, archived: false },
            select: { id: true, name: true },
        });

        const completions = await db.habitCompletion.findMany({
            where: { habit: { userId } },
            include: { habit: { select: { name: true } } },
            orderBy: { date: "desc" },
            take: 100,
        });

        const todayKey = format(new Date(), "yyyy-MM-dd");
        const todayCompletions = completions.filter(
            (c) => format(c.date, "yyyy-MM-dd") === todayKey
        );

        // Step 3: Handle based on intent
        let response: AIResponse;

        switch (intent) {
            case "log_habit":
                response = await handleLogHabit(message, habits);
                break;

            case "coach":
                response = await handleCoach(message);
                break;

            case "insight":
                const habitStats = habits.map((h) => {
                    const habitCompletions = completions.filter((c) => c.habitId === h.id);
                    const totalDays = 30;
                    const completedDays = new Set(
                        habitCompletions.map((c) => format(c.date, "yyyy-MM-dd"))
                    ).size;
                    return {
                        habitName: h.name,
                        completionRate: (completedDays / totalDays) * 100,
                        currentStreak: 0, // Simplified
                    };
                });

                const completionData = completions.map((c) => ({
                    date: format(c.date, "yyyy-MM-dd"),
                    habitId: c.habitId,
                    habitName: c.habit.name,
                }));

                response = await handleInsight(message, completionData, habitStats);
                break;

            case "reflection":
                const completedHabitIds = new Set(todayCompletions.map((c) => c.habitId));
                const completedHabits = habits
                    .filter((h) => completedHabitIds.has(h.id))
                    .map((h) => h.name);
                const missedHabits = habits
                    .filter((h) => !completedHabitIds.has(h.id))
                    .map((h) => h.name);

                response = await handleReflection(message, {
                    completedCount: completedHabits.length,
                    totalHabits: habits.length,
                    completedHabits,
                    missedHabits,
                    currentStreak: 0, // Simplified
                });
                break;

            default:
                response = {
                    mode: "coach",
                    message: "I'm here to help with your habits. Tell me what's on your mind.",
                    data: null,
                };
        }

        return NextResponse.json({ data: response });
    } catch (error) {
        console.error("[AI API] Error:", error);
        return NextResponse.json(
            { error: "AI processing failed" },
            { status: 500 }
        );
    }
}
