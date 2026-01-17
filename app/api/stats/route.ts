import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { successResponse, errorResponse } from "@/lib/api-response";
import { startOfDay, subDays, eachDayOfInterval, format } from "date-fns";

export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user) {
            return errorResponse("Unauthorized", 401);
        }

        const userId = (session.user as any).id;

        // Get all active habits
        const habits = await db.habit.findMany({
            where: {
                userId,
                archived: false,
            },
            include: {
                completions: {
                    orderBy: { date: "desc" },
                },
            },
        });

        const today = startOfDay(new Date());

        // Calculate stats for each habit
        const habitStats = habits.map((habit) => {
            // For streaks: only count real-time completions (not backfills)
            const streakCompletionDates = new Set(
                habit.completions
                    .filter((c) => !c.isBackfill) // Only non-backfill for streaks!
                    .map((c) => format(c.date, "yyyy-MM-dd"))
            );

            // For display: all completions
            const allCompletionDates = new Set(
                habit.completions.map((c) => format(c.date, "yyyy-MM-dd"))
            );

            // Calculate current streak using only real-time completions
            let currentStreak = 0;
            let checkDate = today;

            while (true) {
                const dateKey = format(checkDate, "yyyy-MM-dd");
                if (streakCompletionDates.has(dateKey)) {
                    currentStreak++;
                    checkDate = subDays(checkDate, 1);
                } else {
                    // Check if we should also count yesterday for a streak that's still active
                    if (currentStreak === 0) {
                        const yesterday = subDays(today, 1);
                        const yesterdayKey = format(yesterday, "yyyy-MM-dd");
                        if (streakCompletionDates.has(yesterdayKey)) {
                            checkDate = yesterday;
                            continue;
                        }
                    }
                    break;
                }
            }

            // Calculate longest streak using only real-time completions
            let longestStreak = 0;
            let tempStreak = 0;
            const sortedDates = [...streakCompletionDates].sort().reverse();

            for (let i = 0; i < sortedDates.length; i++) {
                if (i === 0) {
                    tempStreak = 1;
                } else {
                    const currentDate = new Date(sortedDates[i]);
                    const prevDate = new Date(sortedDates[i - 1]);
                    const diffDays = Math.floor(
                        (prevDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24)
                    );

                    if (diffDays === 1) {
                        tempStreak++;
                    } else {
                        longestStreak = Math.max(longestStreak, tempStreak);
                        tempStreak = 1;
                    }
                }
            }
            longestStreak = Math.max(longestStreak, tempStreak);

            // Calculate this month's completion rate (all completions for display)
            const thisMonth = new Date();
            const monthStart = new Date(thisMonth.getFullYear(), thisMonth.getMonth(), 1);
            const daysThisMonth = eachDayOfInterval({ start: monthStart, end: today });
            const completedThisMonth = daysThisMonth.filter((d) =>
                allCompletionDates.has(format(d, "yyyy-MM-dd"))
            ).length;
            const monthlyRate = Math.round((completedThisMonth / daysThisMonth.length) * 100);

            return {
                habitId: habit.id,
                habitName: habit.name,
                currentStreak,
                longestStreak,
                monthlyRate,
                totalCompletions: habit.completions.length,
            };
        });

        // ==============================
        // PERFECT DAY STREAK CALCULATION
        // A "perfect day" = ALL active habits completed (non-backfill)
        // ==============================

        // Get all non-backfill completions
        const allCompletions = await db.habitCompletion.findMany({
            where: {
                habit: { userId, archived: false },
                isBackfill: false, // Only real-time completions count
            },
            select: { date: true, habitId: true },
        });

        // Group completions by date
        const completionsByDate = new Map<string, Set<string>>();
        allCompletions.forEach((c) => {
            const dateKey = format(c.date, "yyyy-MM-dd");
            if (!completionsByDate.has(dateKey)) {
                completionsByDate.set(dateKey, new Set());
            }
            completionsByDate.get(dateKey)!.add(c.habitId);
        });

        // Check if a day is a "perfect day" (all habits completed)
        const isPerfectDay = (dateKey: string) => {
            const completed = completionsByDate.get(dateKey);
            if (!completed) return false;
            // All active habits must be completed
            return habits.every((h) => completed.has(h.id));
        };

        // Calculate current perfect day streak
        let perfectDayStreak = 0;
        let checkDate = today;

        // Check today first
        if (isPerfectDay(format(checkDate, "yyyy-MM-dd"))) {
            perfectDayStreak = 1;
            checkDate = subDays(checkDate, 1);
            // Keep counting backwards
            while (isPerfectDay(format(checkDate, "yyyy-MM-dd"))) {
                perfectDayStreak++;
                checkDate = subDays(checkDate, 1);
            }
        } else {
            // Check if yesterday was perfect (streak still active)
            const yesterday = subDays(today, 1);
            if (isPerfectDay(format(yesterday, "yyyy-MM-dd"))) {
                perfectDayStreak = 1;
                checkDate = subDays(yesterday, 1);
                while (isPerfectDay(format(checkDate, "yyyy-MM-dd"))) {
                    perfectDayStreak++;
                    checkDate = subDays(checkDate, 1);
                }
            }
        }

        // Calculate longest perfect day streak (looking back 90 days)
        let longestPerfectStreak = 0;
        let currentRun = 0;

        for (let i = 0; i < 90; i++) {
            const dateKey = format(subDays(today, i), "yyyy-MM-dd");
            if (isPerfectDay(dateKey)) {
                currentRun++;
                longestPerfectStreak = Math.max(longestPerfectStreak, currentRun);
            } else {
                currentRun = 0;
            }
        }

        // Today's completion status
        const todayKey = format(today, "yyyy-MM-dd");
        const todayCompletedSet = completionsByDate.get(todayKey) || new Set();
        const todayCompletions = todayCompletedSet.size;

        // Monthly completion rate (perfect days this month / days this month)
        const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
        const daysThisMonth = eachDayOfInterval({ start: monthStart, end: today });
        const perfectDaysThisMonth = daysThisMonth.filter((d) =>
            isPerfectDay(format(d, "yyyy-MM-dd"))
        ).length;
        const monthlyPerfectRate = Math.round((perfectDaysThisMonth / daysThisMonth.length) * 100);

        return successResponse({
            overview: {
                totalHabits: habits.length,
                todayCompleted: todayCompletions,
                todayTotal: habits.length,
                currentStreak: perfectDayStreak,      // Perfect day streak
                longestStreak: longestPerfectStreak,  // Longest perfect day streak
                monthlyCompletionRate: monthlyPerfectRate,
            },
            habits: habitStats,
        });
    } catch (error) {
        return errorResponse(error);
    }
}
