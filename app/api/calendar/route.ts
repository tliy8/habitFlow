import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { successResponse, errorResponse } from "@/lib/api-response";
import { startOfMonth, endOfMonth, parseISO, format } from "date-fns";

export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user) {
            return errorResponse("Unauthorized", 401);
        }

        const { searchParams } = new URL(req.url);
        const monthParam = searchParams.get("month"); // Format: YYYY-MM

        // Default to current month if not provided
        const targetDate = monthParam ? parseISO(`${monthParam}-01`) : new Date();
        const monthStart = startOfMonth(targetDate);
        const monthEnd = endOfMonth(targetDate);

        const userId = (session.user as any).id;

        // Get all habits for the user (including archived for filters)
        const habits = await db.habit.findMany({
            where: {
                userId,
            },
            select: {
                id: true,
                name: true,
                description: true,
                frequency: true,
                weeklyDays: true,
                color: true,
                reminderTime: true,
                archived: true,
            },
            orderBy: { createdAt: "desc" },
        });

        // Get completions for the month
        const completions = await db.habitCompletion.findMany({
            where: {
                habit: {
                    userId,
                },
                date: {
                    gte: monthStart,
                    lte: monthEnd,
                },
            },
            include: {
                habit: {
                    select: {
                        id: true,
                        name: true,
                        color: true,
                    },
                },
            },
        });

        // Format completions with habit info - use local date format to avoid timezone issues
        const formattedCompletions = completions.map((c) => ({
            date: format(c.date, "yyyy-MM-dd'T'HH:mm:ss"), // Local timezone format
            habitId: c.habit.id,
            habitName: c.habit.name,
            habitColor: c.habit.color || "#8b5cf6",
            isBackfill: c.isBackfill || false,
        }));

        return successResponse({
            month: monthParam || formatMonth(new Date()),
            habits: habits,
            completions: formattedCompletions,
        });
    } catch (error) {
        return errorResponse(error);
    }
}

function formatMonth(date: Date): string {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}
