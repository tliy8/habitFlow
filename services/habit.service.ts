import { db } from "@/lib/db";
import { CreateHabitInput, UpdateHabitInput } from "@/lib/validations/habit";
import { startOfDay, subDays, isSameDay, differenceInDays, isToday } from "date-fns";

export class HabitService {
    static async getHabits(userId: string) {
        const habits = await db.habit.findMany({
            where: { userId, archived: false },
            include: {
                completions: {
                    orderBy: { date: "desc" },
                },
            },
            orderBy: { createdAt: "desc" },
        });

        return habits.map((habit) => {
            // Only non-backfill completions count for streak
            const nonBackfillCompletions = habit.completions
                .filter((c) => !c.isBackfill)
                .map((c) => c.date);
            const { currentStreak, longestStreak } = this.calculateStreaks(nonBackfillCompletions);

            const today = startOfDay(new Date());
            const isCompletedToday = habit.completions.some((c) => isSameDay(c.date, today));

            return {
                ...habit,
                streak: {
                    current: currentStreak,
                    longest: longestStreak,
                },
                completedToday: isCompletedToday,
            };
        });
    }

    static async createHabit(userId: string, data: CreateHabitInput) {
        return db.habit.create({
            data: {
                ...data,
                userId,
            },
        });
    }

    static async updateHabit(userId: string, habitId: string, data: UpdateHabitInput) {
        const habit = await db.habit.findFirst({
            where: { id: habitId, userId },
        });

        if (!habit) throw new Error("Habit not found");

        return db.habit.update({
            where: { id: habitId },
            data,
        });
    }

    static async deleteHabit(userId: string, habitId: string) {
        const habit = await db.habit.findFirst({
            where: { id: habitId, userId },
        });

        if (!habit) throw new Error("Habit not found");

        return db.habit.delete({
            where: { id: habitId },
        });
    }

    /**
     * Toggle habit completion with backfill awareness
     * Backfilled completions (past dates) don't affect streaks
     */
    static async toggleCompletion(
        userId: string,
        habitId: string,
        date?: Date,
        isBackfill: boolean = false
    ) {
        const habit = await db.habit.findFirst({
            where: { id: habitId, userId },
        });

        if (!habit) throw new Error("Habit not found");

        const targetDate = startOfDay(date || new Date());

        // Auto-detect backfill if date is in the past
        const autoIsBackfill = isBackfill || (!isToday(targetDate) && targetDate < new Date());

        const existingCompletion = await db.habitCompletion.findFirst({
            where: {
                habitId,
                date: targetDate,
            },
        });

        if (existingCompletion) {
            await db.habitCompletion.delete({
                where: { id: existingCompletion.id },
            });
            return { completed: false, isBackfill: autoIsBackfill };
        } else {
            await db.habitCompletion.create({
                data: {
                    habitId,
                    date: targetDate,
                    isBackfill: autoIsBackfill,
                },
            });
            return { completed: true, isBackfill: autoIsBackfill };
        }
    }

    /**
     * Calculate streaks from real-time completions only (non-backfill)
     */
    private static calculateStreaks(dates: Date[]) {
        if (dates.length === 0) return { currentStreak: 0, longestStreak: 0 };

        const sortedDates = dates
            .map((d) => startOfDay(d))
            .sort((a, b) => b.getTime() - a.getTime());

        // Deduplicate
        const uniqueDates = Array.from(new Set(sortedDates.map((d) => d.getTime()))).map(
            (t) => new Date(t)
        );

        const today = startOfDay(new Date());
        const yesterday = subDays(today, 1);
        const dateSet = new Set(uniqueDates.map(d => d.getTime()));

        // Current Streak - starts from today or yesterday
        let currentStreak = 0;
        let checkDate = today;

        if (!dateSet.has(checkDate.getTime())) {
            // Check if yesterday starts the streak
            checkDate = yesterday;
            if (!dateSet.has(checkDate.getTime())) {
                currentStreak = 0;
            } else {
                currentStreak = 1;
                checkDate = subDays(checkDate, 1);
                while (dateSet.has(checkDate.getTime())) {
                    currentStreak++;
                    checkDate = subDays(checkDate, 1);
                }
            }
        } else {
            currentStreak = 1;
            checkDate = subDays(checkDate, 1);
            while (dateSet.has(checkDate.getTime())) {
                currentStreak++;
                checkDate = subDays(checkDate, 1);
            }
        }

        // Longest Streak
        let longestStreak = 0;
        let currentRun = 0;

        for (let i = 0; i < uniqueDates.length; i++) {
            if (i === 0) {
                currentRun = 1;
            } else {
                const diff = differenceInDays(uniqueDates[i - 1], uniqueDates[i]);
                if (diff === 1) {
                    currentRun++;
                } else {
                    currentRun = 1;
                }
            }
            if (currentRun > longestStreak) longestStreak = currentRun;
        }

        return { currentStreak, longestStreak };
    }
}
