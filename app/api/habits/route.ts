import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { HabitService } from "@/services/habit.service";
import { createHabitSchema } from "@/lib/validations/habit";
import { successResponse, errorResponse } from "@/lib/api-response";

export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return errorResponse("Unauthorized", 401);
        }

        const habits = await HabitService.getHabits((session.user as any).id);
        return successResponse(habits);
    } catch (error) {
        return errorResponse(error);
    }
}

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return errorResponse("Unauthorized", 401);
        }

        const body = await req.json();
        const validatedData = createHabitSchema.parse(body);

        const habit = await HabitService.createHabit((session.user as any).id, validatedData);
        return successResponse(habit, 201);
    } catch (error) {
        return errorResponse(error);
    }
}
