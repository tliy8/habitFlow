"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
    format,
    startOfMonth,
    endOfMonth,
    eachDayOfInterval,
    addMonths,
    subMonths,
    startOfWeek,
    endOfWeek,
    isSameMonth,
} from "date-fns";
import HeatmapDay from "./HeatmapDay";

interface Completion {
    date: string;
    habitId: string;
}

interface HeatmapCalendarProps {
    completions: Completion[];
    totalHabits: number;
    onDayClick: (date: Date) => void;
    onMonthChange?: (month: string) => void;
}

const WEEKDAYS = ["S", "M", "T", "W", "T", "F", "S"];

export default function HeatmapCalendar({
    completions,
    totalHabits,
    onDayClick,
    onMonthChange,
}: HeatmapCalendarProps) {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [direction, setDirection] = useState(0);

    // Build completion rate map
    const completionRateMap = useMemo(() => {
        const map = new Map<string, number>();

        // Count completions per day
        const dayCompletions = new Map<string, Set<string>>();
        completions.forEach((c) => {
            const dayKey = c.date.split("T")[0];
            if (!dayCompletions.has(dayKey)) {
                dayCompletions.set(dayKey, new Set());
            }
            dayCompletions.get(dayKey)!.add(c.habitId);
        });

        // Calculate rate
        dayCompletions.forEach((habitIds, dayKey) => {
            const rate = totalHabits > 0 ? (habitIds.size / totalHabits) * 100 : 0;
            map.set(dayKey, rate);
        });

        return map;
    }, [completions, totalHabits]);

    // Generate calendar days
    const calendarDays = useMemo(() => {
        const monthStart = startOfMonth(currentDate);
        const monthEnd = endOfMonth(currentDate);
        const calendarStart = startOfWeek(monthStart);
        const calendarEnd = endOfWeek(monthEnd);

        return eachDayOfInterval({ start: calendarStart, end: calendarEnd });
    }, [currentDate]);

    const handlePrevMonth = () => {
        setDirection(-1);
        const newDate = subMonths(currentDate, 1);
        setCurrentDate(newDate);
        onMonthChange?.(format(newDate, "yyyy-MM"));
    };

    const handleNextMonth = () => {
        setDirection(1);
        const newDate = addMonths(currentDate, 1);
        setCurrentDate(newDate);
        onMonthChange?.(format(newDate, "yyyy-MM"));
    };

    return (
        <div className="bg-white rounded-2xl border shadow-sm p-5">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <button
                    onClick={handlePrevMonth}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                    <ChevronLeft className="h-5 w-5 text-gray-600" />
                </button>

                <motion.h3
                    key={format(currentDate, "MMMM yyyy")}
                    initial={{ opacity: 0, y: direction * 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-lg font-semibold text-gray-900"
                >
                    {format(currentDate, "MMMM yyyy")}
                </motion.h3>

                <button
                    onClick={handleNextMonth}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                    <ChevronRight className="h-5 w-5 text-gray-600" />
                </button>
            </div>

            {/* Weekday headers */}
            <div className="grid grid-cols-7 gap-1 mb-2">
                {WEEKDAYS.map((day, i) => (
                    <div key={i} className="text-center text-xs font-medium text-gray-400 py-1">
                        {day}
                    </div>
                ))}
            </div>

            {/* Calendar grid */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={format(currentDate, "yyyy-MM")}
                    initial={{ opacity: 0, x: direction * 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -direction * 20 }}
                    transition={{ duration: 0.2 }}
                    className="grid grid-cols-7 gap-1"
                >
                    {calendarDays.map((date) => {
                        const dayKey = format(date, "yyyy-MM-dd");
                        const intensity = completionRateMap.get(dayKey) || 0;
                        const isCurrentMonth = isSameMonth(date, currentDate);

                        return (
                            <HeatmapDay
                                key={dayKey}
                                date={date}
                                intensity={intensity}
                                isCurrentMonth={isCurrentMonth}
                                onClick={() => onDayClick(date)}
                            />
                        );
                    })}
                </motion.div>
            </AnimatePresence>

            {/* Legend */}
            <div className="flex items-center justify-center gap-2 mt-4 text-xs text-gray-500">
                <span>Less</span>
                <div className="flex gap-0.5">
                    <div className="w-3 h-3 rounded-sm bg-gray-100" />
                    <div className="w-3 h-3 rounded-sm bg-violet-200" />
                    <div className="w-3 h-3 rounded-sm bg-violet-300" />
                    <div className="w-3 h-3 rounded-sm bg-violet-400" />
                    <div className="w-3 h-3 rounded-sm bg-violet-500" />
                    <div className="w-3 h-3 rounded-sm bg-emerald-500" />
                </div>
                <span>More</span>
            </div>
        </div>
    );
}
