import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { HabitService } from "@/services/habit.service";
import { updateHabitSchema } from "@/lib/validations/habit";
import { successResponse, errorResponse } from "@/lib/api-response";

export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ habitId: string }> }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return errorResponse("Unauthorized", 401);
        }

        const { habitId } = await params;
        const body = await req.json();
        const validatedData = updateHabitSchema.parse(body);

        const habit = await HabitService.updateHabit(
            (session.user as any).id,
            habitId,
            validatedData
        );

        return successResponse(habit);
    } catch (error) {
        return errorResponse(error);
    }
}

export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ habitId: string }> }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return errorResponse("Unauthorized", 401);
        }

        const { habitId } = await params;

        await HabitService.deleteHabit((session.user as any).id, habitId);

        return successResponse({ deleted: true });
    } catch (error) {
        return errorResponse(error);
    }
}
