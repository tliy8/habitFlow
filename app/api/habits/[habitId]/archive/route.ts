import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { successResponse, errorResponse } from "@/lib/api-response";

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ habitId: string }> }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return errorResponse("Unauthorized", 401);
        }

        const { habitId } = await params;
        const userId = (session.user as any).id;

        // Verify ownership
        const habit = await db.habit.findFirst({
            where: { id: habitId, userId },
        });

        if (!habit) {
            return errorResponse("Habit not found", 404);
        }

        // Toggle archive status
        const updated = await db.habit.update({
            where: { id: habitId },
            data: { archived: !habit.archived },
        });

        return successResponse({ archived: updated.archived });
    } catch (error) {
        return errorResponse(error);
    }
}
