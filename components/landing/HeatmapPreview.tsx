"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, startOfWeek, endOfWeek, isSameMonth, isToday, subDays } from "date-fns";

interface HeatmapPreviewProps {
    completedHabits: Set<string>;
    totalHabits: number;
    selectedDate: string | null;
    onDateClick: (dateKey: string) => void;
    onDateHover: (dateKey: string) => void;
    reducedMotion: boolean;
}

const WEEKDAYS = ["S", "M", "T", "W", "T", "F", "S"];

// Generate demo completion data
function generateDemoData(): Map<string, number> {
    const data = new Map<string, number>();
    const today = new Date();

    // Fill last 30 days with random completion rates
    for (let i = 1; i <= 30; i++) {
        const date = subDays(today, i);
        const rate = Math.random();
        // Make it look realistic - some perfect days, some partial, some missed
        if (rate > 0.7) {
            data.set(format(date, "yyyy-MM-dd"), 100);
        } else if (rate > 0.3) {
            data.set(format(date, "yyyy-MM-dd"), Math.floor(Math.random() * 50) + 25);
        }
        // else: 0 (missed)
    }

    return data;
}

function getIntensityColor(intensity: number): string {
    if (intensity === 0) return "bg-gray-100";
    if (intensity < 25) return "bg-violet-200";
    if (intensity < 50) return "bg-violet-300";
    if (intensity < 75) return "bg-violet-400";
    if (intensity < 100) return "bg-violet-500";
    return "bg-emerald-500"; // 100%
}

export default function HeatmapPreview({
    completedHabits,
    totalHabits,
    selectedDate,
    onDateClick,
    onDateHover,
    reducedMotion,
}: HeatmapPreviewProps) {
    const [hoveredDate, setHoveredDate] = useState<string | null>(null);

    // Demo data - memoized so it doesn't regenerate
    const demoData = useMemo(() => generateDemoData(), []);

    // Current month calendar
    const calendarDays = useMemo(() => {
        const currentDate = new Date();
        const monthStart = startOfMonth(currentDate);
        const monthEnd = endOfMonth(currentDate);
        const calendarStart = startOfWeek(monthStart);
        const calendarEnd = endOfWeek(monthEnd);
        return eachDayOfInterval({ start: calendarStart, end: calendarEnd });
    }, []);

    // Calculate intensity for a date
    const getDateIntensity = (dateKey: string) => {
        // If today and user completed habits in demo
        if (dateKey === format(new Date(), "yyyy-MM-dd")) {
            return totalHabits > 0 ? (completedHabits.size / totalHabits) * 100 : 0;
        }
        return demoData.get(dateKey) || 0;
    };

    // Get tooltip text
    const getTooltipText = (date: Date, intensity: number) => {
        const dayName = format(date, "EEE MMM d");
        if (intensity === 100) return `${dayName} • Perfect day 🎉`;
        if (intensity > 0) return `${dayName} • ${Math.round(intensity)}% done`;
        return `${dayName} • No habits logged`;
    };

    return (
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 relative">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                    {format(new Date(), "MMMM yyyy")}
                </h3>
                <span className="text-sm text-violet-600 font-medium">
                    Interactive Preview
                </span>
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
            <div className="grid grid-cols-7 gap-1">
                {calendarDays.map((date, index) => {
                    const dateKey = format(date, "yyyy-MM-dd");
                    const intensity = getDateIntensity(dateKey);
                    const isCurrentMonth = isSameMonth(date, new Date());
                    const isDateToday = isToday(date);
                    const isSelected = selectedDate === dateKey;
                    const isHovered = hoveredDate === dateKey;

                    return (
                        <motion.button
                            key={dateKey}
                            onClick={() => {
                                onDateClick(dateKey);
                            }}
                            onMouseEnter={() => {
                                setHoveredDate(dateKey);
                                onDateHover(dateKey);
                            }}
                            onMouseLeave={() => setHoveredDate(null)}
                            onFocus={() => setHoveredDate(dateKey)}
                            onBlur={() => setHoveredDate(null)}
                            initial={reducedMotion ? false : { opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{
                                delay: reducedMotion ? 0 : index * 0.02,
                                duration: reducedMotion ? 0.1 : 0.2,
                            }}
                            whileHover={reducedMotion ? {} : { scale: 1.15 }}
                            whileTap={reducedMotion ? {} : { scale: 0.95 }}
                            className={`
                relative aspect-square rounded-lg flex items-center justify-center text-sm font-medium
                transition-all focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2
                ${getIntensityColor(intensity)}
                ${isCurrentMonth ? "text-gray-700" : "text-gray-400 opacity-50"}
                ${isDateToday ? "ring-2 ring-violet-600 ring-offset-2" : ""}
                ${isSelected ? "ring-2 ring-violet-600" : ""}
                ${intensity === 100 && !isDateToday ? "text-white" : ""}
                cursor-pointer
              `}
                            aria-label={getTooltipText(date, intensity)}
                            role="gridcell"
                            tabIndex={0}
                        >
                            <span className="relative z-10">{format(date, "d")}</span>

                            {/* Tooltip */}
                            <AnimatePresence>
                                {isHovered && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 5 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 5 }}
                                        transition={{ duration: 0.15 }}
                                        className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-gray-900 text-white text-xs rounded-lg whitespace-nowrap z-50 pointer-events-none"
                                        role="tooltip"
                                    >
                                        {getTooltipText(date, intensity)}
                                        <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900" />
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.button>
                    );
                })}
            </div>

            {/* Legend */}
            <div className="flex items-center justify-center gap-2 mt-4 text-xs text-gray-500">
                <span>Less</span>
                <div className="flex gap-0.5">
                    <div className="w-3 h-3 rounded-sm bg-gray-100" title="0%" />
                    <div className="w-3 h-3 rounded-sm bg-violet-200" title="25%" />
                    <div className="w-3 h-3 rounded-sm bg-violet-400" title="50%" />
                    <div className="w-3 h-3 rounded-sm bg-violet-500" title="75%" />
                    <div className="w-3 h-3 rounded-sm bg-emerald-500" title="100%" />
                </div>
                <span>More</span>
            </div>

            {/* Instruction text */}
            <p className="text-center text-sm text-gray-500 mt-4">
                Click any day to see habit details →
            </p>
        </div>
    );
}
