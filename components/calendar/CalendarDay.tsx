"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { isToday, isFuture, isPast } from "date-fns";
import { format /* isCurrentMonth */ } from "date-fns";

interface HabitCompletion {
    date: string;
    habitId: string;
    habitName: string;
    habitColor: string;
}

interface CalendarDayProps {
    date: Date;
    currentMonth: Date;
    completions: HabitCompletion[];
    completionRate: number;
    totalHabits: number;
    onClick: () => void;
}

// 5-level heat map colors
function getHeatMapColor(rate: number, isDateToday: boolean, isDatePast: boolean): string {
    if (rate === 0) return isDatePast ? "bg-gray-100" : "bg-gray-50";
    if (rate < 25) return "bg-amber-100";
    if (rate < 50) return "bg-amber-200";
    if (rate < 75) return "bg-emerald-200";
    if (rate < 100) return "bg-emerald-300";
    return "bg-emerald-400"; // 100%
}

export default function CalendarDay({
    date,
    currentMonth,
    completions,
    completionRate,
    totalHabits,
    onClick,
}: CalendarDayProps) {
    const isDateToday = isToday(date);
    const isDateFuture = isFuture(date);
    const isDatePast = isPast(date) && !isDateToday;
    const isInCurrentMonth = date.getMonth() === currentMonth.getMonth();
    const dayNumber = format(date, "d");

    // Get unique habit colors for dots (max 4)
    const uniqueColors = [...new Set(completions.map((c) => c.habitColor))].slice(0, 4);

    // Determine cell state
    const cellState = isDateToday ? "today" : isDateFuture ? "future" : "past";

    return (
        <motion.button
            whileHover={{ scale: isDateFuture ? 1 : 1.03 }}
            whileTap={{ scale: isDateFuture ? 1 : 0.97 }}
            onClick={onClick}
            className={cn(
                "relative aspect-square p-1 rounded-xl transition-all duration-200",
                "flex flex-col items-center justify-center gap-0.5",
                "focus:outline-none",

                // Current month styling
                isInCurrentMonth ? "text-gray-900" : "text-gray-300",

                // Heat map (only for past/today with completions)
                isInCurrentMonth && !isDateFuture && totalHabits > 0 &&
                getHeatMapColor(completionRate, isDateToday, isDatePast),

                // TODAY - Highlighted with ring
                isDateToday && "ring-2 ring-violet-500 ring-offset-2 bg-violet-50",

                // PAST - Muted
                isDatePast && isInCurrentMonth && "opacity-80",

                // FUTURE - Greyed, disabled
                isDateFuture && "opacity-40 cursor-not-allowed bg-gray-50",

                // Hover (only for past/today)
                !isDateFuture && isInCurrentMonth && "hover:ring-2 hover:ring-violet-300 cursor-pointer"
            )}
            disabled={isDateFuture}
            title={
                isDateFuture
                    ? "Completion only available on the day itself"
                    : isDatePast
                        ? "Past date - changes won't affect streaks"
                        : "Today - tap to log habits"
            }
        >
            {/* Day Number */}
            <span
                className={cn(
                    "text-sm font-semibold",
                    isDateToday && "text-violet-700",
                    isDateFuture && "text-gray-400"
                )}
            >
                {dayNumber}
            </span>

            {/* Completion Dots */}
            {uniqueColors.length > 0 && (
                <div className="flex gap-0.5">
                    {uniqueColors.map((color, i) => (
                        <motion.div
                            key={i}
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: i * 0.03 }}
                            className="w-1.5 h-1.5 rounded-full"
                            style={{ backgroundColor: color }}
                        />
                    ))}
                </div>
            )}

            {/* Full completion checkmark */}
            {completionRate === 100 && totalHabits > 0 && (
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full flex items-center justify-center shadow-sm"
                >
                    <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                </motion.div>
            )}

            {/* Future lock indicator */}
            {isDateFuture && isInCurrentMonth && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-1 h-1 bg-gray-300 rounded-full" />
                </div>
            )}
        </motion.button>
    );
}
