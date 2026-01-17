import { z } from 'zod';

export const createHabitSchema = z.object({
    name: z.string().min(1, 'Name is required').max(100, 'Name is too long'),
    description: z.string().optional(),
    frequency: z.enum(['daily', 'weekly']).default('daily'),
    weeklyDays: z.string().optional(), // JSON array: "[0,1,2,3,4,5,6]"
    color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
    reminderTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/).optional(), // HH:MM
});

export const updateHabitSchema = createHabitSchema.partial().extend({
    archived: z.boolean().optional(),
});

export type CreateHabitInput = z.infer<typeof createHabitSchema>;
export type UpdateHabitInput = z.infer<typeof updateHabitSchema>;
