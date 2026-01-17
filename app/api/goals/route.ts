import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { successResponse, errorResponse } from "@/lib/api-response";
import { z } from "zod";

const createGoalSchema = z.object({
    habitId: z.string(),
    type: z.enum(["streak", "consistency"]).default("streak"),
    targetDays: z.number().min(1).max(365),
});

// GET: List user's goals
export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return errorResponse("Unauthorized", 401);
        }

        const userId = (session.user as any).id;

        const goals = await db.goal.findMany({
            where: { userId },
            include: {
                habit: {
                    select: { id: true, name: true, color: true },
                },
            },
            orderBy: { createdAt: "desc" },
        });

        return successResponse(goals);
    } catch (error) {
        return errorResponse(error);
    }
}

// POST: Create a new goal
export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return errorResponse("Unauthorized", 401);
        }

        const userId = (session.user as any).id;
        const body = await req.json();
        const { habitId, type, targetDays } = createGoalSchema.parse(body);

        // Verify habit ownership
        const habit = await db.habit.findFirst({
            where: { id: habitId, userId },
        });

        if (!habit) {
            return errorResponse("Habit not found", 404);
        }

        const goal = await db.goal.create({
            data: {
                habitId,
                userId,
                type,
                targetDays,
            },
        });

        return successResponse(goal, 201);
    } catch (error) {
        return errorResponse(error);
    }
}
