import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";
import { successResponse, errorResponse } from "@/lib/api-response";
import { z } from "zod";

const registerSchema = z.object({
    name: z.string().min(1, "Name is required"),
    email: z.string().email("Invalid email"),
    password: z.string().min(6, "Password must be at least 6 characters"),
});

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { name, email, password } = registerSchema.parse(body);

        // Check if user exists
        const existingUser = await db.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            return errorResponse("Email already registered", 400);
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 12);

        // Create user
        const user = await db.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
            },
        });

        return successResponse({ id: user.id, email: user.email }, 201);
    } catch (error) {
        return errorResponse(error);
    }
}
