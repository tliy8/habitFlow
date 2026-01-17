"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { format, subDays, isToday } from "date-fns";

interface WeeklySnapshotProps {
    completions: { date: string; habitId: string }[];
    totalHabits: number;
}

export default function WeeklySnapshot({
    completions,
    totalHabits,
}: WeeklySnapshotProps) {
    // Calculate last 7 days data
    const weekData = useMemo(() => {
        const today = new Date();
        const days = [];

        for (let i = 6; i >= 0; i--) {
            const date = subDays(today, i);
            const dateKey = format(date, "yyyy-MM-dd");
            const dayCompletions = completions.filter(
                (c) => c.date.split("T")[0] === dateKey
            );
            const uniqueHabits = new Set(dayCompletions.map((c) => c.habitId));
            const percentage = totalHabits > 0 ? (uniqueHabits.size / totalHabits) * 100 : 0;

            days.push({
                date,
                dateKey,
                dayName: format(date, "EEE"),
                percentage,
                isToday: isToday(date),
                isPerfect: percentage === 100,
            });
        }

        return days;
    }, [completions, totalHabits]);

    // Calculate weekly average
    const weeklyAverage = useMemo(() => {
        const sum = weekData.reduce((acc, day) => acc + day.percentage, 0);
        return Math.round(sum / 7);
    }, [weekData]);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl border shadow-sm p-5"
        >
            <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">This Week</h3>
                <span className="text-sm text-gray-500">{weeklyAverage}% avg</span>
            </div>

            {/* Bar chart */}
            <div className="flex items-end justify-between gap-2 h-24">
                {weekData.map((day, index) => (
                    <div key={day.dateKey} className="flex-1 flex flex-col items-center">
                        {/* Bar */}
                        <div className="w-full h-20 flex items-end">
                            <motion.div
                                initial={{ height: 0 }}
                                animate={{ height: `${Math.max(day.percentage, 5)}%` }}
                                transition={{ delay: index * 0.05, duration: 0.3 }}
                                className={`w-full rounded-t-md ${day.isPerfect
                                        ? "bg-emerald-500"
                                        : day.percentage > 0
                                            ? "bg-violet-400"
                                            : "bg-gray-100"
                                    } ${day.isToday ? "ring-2 ring-violet-600 ring-offset-1" : ""}`}
                                title={`${Math.round(day.percentage)}%`}
                            />
                        </div>

                        {/* Day label */}
                        <span className={`text-xs mt-2 ${day.isToday ? "font-bold text-violet-600" : "text-gray-400"
                            }`}>
                            {day.dayName}
                        </span>
                    </div>
                ))}
            </div>

            {/* Legend */}
            <div className="flex items-center justify-center gap-4 mt-4 text-xs text-gray-500">
                <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span>Perfect</span>
                </div>
                <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-violet-400" />
                    <span>Partial</span>
                </div>
                <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-gray-200" />
                    <span>Missed</span>
                </div>
            </div>
        </motion.div>
    );
}
