import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { HabitService } from "@/services/habit.service";
import { successResponse, errorResponse } from "@/lib/api-response";
import { z } from "zod";

const toggleSchema = z.object({
    date: z.string().optional(),
    isBackfill: z.boolean().optional(),
});

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ habitId: string }> }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return errorResponse("Unauthorized", 401);
        }

        const { habitId } = await params;
        const body = await req.json().catch(() => ({}));
        const { date, isBackfill } = toggleSchema.parse(body);

        const dateObj = date ? new Date(date) : new Date();

        const result = await HabitService.toggleCompletion(
            (session.user as any).id,
            habitId,
            dateObj,
            isBackfill || false
        );

        return successResponse(result);
    } catch (error) {
        console.error("[TOGGLE API ERROR]", error); // Keep error log
        return errorResponse(error);
    }
}
