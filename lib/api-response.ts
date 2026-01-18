import { NextResponse } from 'next/server';
import { ZodError } from 'zod';

type ApiResponse<T> = {
    data?: T;
    error?: string;
    success: boolean;
};

export function successResponse<T>(data: T, status = 200) {
    return NextResponse.json(
        { success: true, data },
        { status }
    );
}

export function errorResponse(error: unknown, status = 500) {
    let message = 'An unexpected error occurred';

    if (error instanceof ZodError) {
        // Flatten Zod errors into a readable string
        message = (error as any).errors.map((e: any) => `${e.path.join('.')}: ${e.message}`).join(', ');
        return NextResponse.json({ success: false, error: message }, { status: 400 });
    }

    if (error instanceof Error) {
        message = error.message;
    } else if (typeof error === 'string') {
        message = error;
    }

    return NextResponse.json(
        { success: false, error: message },
        { status }
    );
}
