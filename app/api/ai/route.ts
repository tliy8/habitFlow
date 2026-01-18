import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { format, subDays, parseISO } from "date-fns";

import { routeIntent } from "@/lib/ai/router";
import { AIResponse } from "@/lib/ai/validator";
import { handleLogHabit } from "@/lib/ai/modes/log-habit";
import { handleCoach } from "@/lib/ai/modes/coach";
import { handleInsight } from "@/lib/ai/modes/insight";
import { handleReflection } from "@/lib/ai/modes/reflection";

// Calculate current streak for a habit
function calculateStreak(habitId: string, completions: Array<{ habitId: string; date: Date }>): number {
    const habitCompletions = completions
        .filter(c => c.habitId === habitId)
        .map(c => format(c.date, "yyyy-MM-dd"))
        .sort()
        .reverse();

    if (habitCompletions.length === 0) return 0;

    let streak = 0;
    let checkDate = new Date();

    // Check if today is completed, if not start from yesterday
    const todayKey = format(checkDate, "yyyy-MM-dd");
    if (!habitCompletions.includes(todayKey)) {
        checkDate = subDays(checkDate, 1);
    }

    // Count consecutive days
    for (let i = 0; i < 365; i++) {
        const dateKey = format(subDays(checkDate, i), "yyyy-MM-dd");
        if (habitCompletions.includes(dateKey)) {
            streak++;
        } else {
            break;
        }
    }

    return streak;
}

export async function POST(req: NextRequest) {
    try {
        // Auth check
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { message, history } = await req.json();

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
        const todayCompletedIds = new Set(todayCompletions.map(c => c.habitId));

        // Step 3: Handle based on intent
        let response: AIResponse;

        switch (intent) {
            case "log_habit":
                response = await handleLogHabit(message, habits, history || []);

                // --- ACTIVE AGENT LOGIC ---
                // Type guard and cast for LogHabitData
                if (response.data && "completions" in response.data) {
                    const logData = response.data as any;

                    // 1. Log Matched Habits
                    if (logData.completions) {
                        for (const completion of logData.completions) {
                            if (completion.matched && completion.habitId) {
                                // Check if already logged today to prevent duplicates
                                if (!todayCompletedIds.has(completion.habitId)) {
                                    await db.habitCompletion.create({
                                        data: {
                                            habitId: completion.habitId,
                                            date: new Date(),
                                        },
                                    });
                                    todayCompletedIds.add(completion.habitId); // Mark as done in local state
                                }
                            }
                        }
                    }

                    // 2. Auto-Create & Log Unmatched Habits
                    if (logData.unmatchedActivities && logData.unmatchedActivities.length > 0) {
                        const createdNames: string[] = [];

                        for (const activityName of logData.unmatchedActivities) {
                            // Create the new habit
                            const newHabit = await db.habit.create({
                                data: {
                                    name: activityName,
                                    userId,
                                    color: "blue", // Default color
                                    icon: "activity", // Default icon
                                },
                            });

                            // Log it for today
                            await db.habitCompletion.create({
                                data: {
                                    habitId: newHabit.id,
                                    date: new Date(),
                                },
                            });

                            createdNames.push(activityName);

                            // Update response data to reflect success
                            logData.completions.push({
                                habitId: newHabit.id,
                                habitName: newHabit.name,
                                matched: true
                            });
                        }

                        // Clear unmatched lists since we handled them
                        logData.unmatchedActivities = [];
                        logData.suggestCreate = false;

                        // 3. Update Response Message
                        if (createdNames.length > 0) {
                            const createdStr = createdNames.join(" and ");
                            const existingStr = logData.completions
                                .filter((c: any) => c.matched && !createdNames.includes(c.habitName))
                                .map((c: any) => c.habitName)
                                .join(" and ");

                            if (existingStr) {
                                response.message = `I've created "${createdStr}" as a new habit and logged it for today. Also logged ${existingStr}.`;
                            } else {
                                response.message = `I've created "${createdStr}" as a new habit and logged it for today. Great start!`;
                            }
                        }
                    }
                }
                break;

            case "coach":
                // Build rich context for personalized coaching
                const coachContext = {
                    habits: habits.map(h => ({
                        name: h.name,
                        completedToday: todayCompletedIds.has(h.id),
                    })),
                    todayCompletedCount: todayCompletions.length,
                    totalHabits: habits.length,
                    longestStreak: Math.max(
                        ...habits.map(h => calculateStreak(h.id, completions)),
                        0
                    ),
                };
                response = await handleCoach(message, coachContext);
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
                        currentStreak: calculateStreak(h.id, completions),
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
                const completedHabits = habits
                    .filter((h) => todayCompletedIds.has(h.id))
                    .map((h) => h.name);
                const missedHabits = habits
                    .filter((h) => !todayCompletedIds.has(h.id))
                    .map((h) => h.name);

                // Find longest current streak
                const longestStreak = Math.max(
                    ...habits.map(h => calculateStreak(h.id, completions)),
                    0
                );

                response = await handleReflection(message, {
                    completedCount: completedHabits.length,
                    totalHabits: habits.length,
                    completedHabits,
                    missedHabits,
                    currentStreak: longestStreak,
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

        // Check if it's a rate limit error
        const errorMessage = error instanceof Error ? error.message : String(error);
        if (errorMessage.includes("429") || errorMessage.includes("quota")) {
            return NextResponse.json(
                {
                    error: "AI is temporarily busy. Please try again in a few seconds.",
                    retryable: true
                },
                { status: 429 }
            );
        }

        return NextResponse.json(
            { error: "AI processing failed. Please try again." },
            { status: 500 }
        );
    }
}
