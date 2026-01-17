"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { isToday, isFuture, format } from "date-fns";

interface HeatmapDayProps {
    date: Date;
    intensity: number; // 0-100 completion rate
    isCurrentMonth: boolean;
    onClick: () => void;
}

// 5-level intensity colors - now applies to all dates including today
function getIntensityColor(intensity: number, isDateToday: boolean): string {
    // Use intensity-based color for all dates
    if (intensity === 0) return isDateToday ? "bg-violet-100" : "bg-gray-100";
    if (intensity < 25) return "bg-violet-200";
    if (intensity < 50) return "bg-violet-300";
    if (intensity < 75) return "bg-violet-400";
    if (intensity < 100) return "bg-violet-500";
    return "bg-emerald-500"; // 100% complete - green for perfect day!
}

export default function HeatmapDay({
    date,
    intensity,
    isCurrentMonth,
    onClick,
}: HeatmapDayProps) {
    const isDateToday = isToday(date);
    const isDateFuture = isFuture(date);
    const dayNumber = format(date, "d");

    return (
        <motion.button
            whileHover={{ scale: isDateFuture ? 1 : 1.1 }}
            whileTap={{ scale: isDateFuture ? 1 : 0.95 }}
            onClick={onClick}
            disabled={isDateFuture}
            className={cn(
                "relative aspect-square rounded-lg flex items-center justify-center text-sm font-medium transition-all",
                getIntensityColor(intensity, isDateToday),

                // Current month text color
                isCurrentMonth ? "text-gray-700" : "text-gray-400",

                // Today styling - purple ring with pulse
                isDateToday && "ring-2 ring-violet-600 ring-offset-2",

                // Future styling - greyed out
                isDateFuture && "opacity-30 cursor-not-allowed",

                // Interactivity
                !isDateFuture && "cursor-pointer hover:ring-2 hover:ring-violet-300",

                // Full completion
                intensity === 100 && !isDateToday && "text-white"
            )}
        >
            {/* Pulsing indicator for today */}
            {isDateToday && (
                <motion.div
                    animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="absolute inset-0 rounded-lg border-2 border-violet-500"
                />
            )}

            <span className="relative z-10">{dayNumber}</span>
        </motion.button>
    );
}
