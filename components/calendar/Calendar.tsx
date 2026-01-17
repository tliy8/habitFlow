"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import CalendarDay from "./CalendarDay";
import {
    getCalendarDays,
    formatDateDisplay,
    getNextMonth,
    getPrevMonth,
    getMonthKey,
} from "@/lib/date-utils";

interface HabitCompletion {
    date: string;
    habitId: string;
    habitName: string;
    habitColor: string;
}

interface CalendarProps {
    completions: HabitCompletion[];
    habits: { id: string; name: string; color?: string }[];
    onDayClick: (date: Date) => void;
    onMonthChange: (monthKey: string) => void;
}

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function Calendar({
    completions,
    habits,
    onDayClick,
    onMonthChange,
}: CalendarProps) {
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [direction, setDirection] = useState(0);

    const days = getCalendarDays(currentMonth);

    // Group completions by date
    const completionsByDate = completions.reduce((acc, completion) => {
        const dateKey = completion.date.split("T")[0];
        if (!acc[dateKey]) acc[dateKey] = [];
        acc[dateKey].push(completion);
        return acc;
    }, {} as Record<string, HabitCompletion[]>);

    const handlePrevMonth = () => {
        setDirection(-1);
        const newMonth = getPrevMonth(currentMonth);
        setCurrentMonth(newMonth);
        onMonthChange(getMonthKey(newMonth));
    };

    const handleNextMonth = () => {
        setDirection(1);
        const newMonth = getNextMonth(currentMonth);
        setCurrentMonth(newMonth);
        onMonthChange(getMonthKey(newMonth));
    };

    const variants = {
        enter: (direction: number) => ({
            x: direction > 0 ? 100 : -100,
            opacity: 0,
        }),
        center: {
            x: 0,
            opacity: 1,
        },
        exit: (direction: number) => ({
            x: direction < 0 ? 100 : -100,
            opacity: 0,
        }),
    };

    return (
        <div className="bg-card rounded-2xl border shadow-lg p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={handlePrevMonth}
                    className="hover:bg-muted"
                >
                    <ChevronLeft className="h-5 w-5" />
                </Button>

                <h2 className="text-xl font-semibold">
                    {formatDateDisplay(currentMonth)}
                </h2>

                <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleNextMonth}
                    className="hover:bg-muted"
                >
                    <ChevronRight className="h-5 w-5" />
                </Button>
            </div>

            {/* Weekday Headers */}
            <div className="grid grid-cols-7 gap-1 mb-2">
                {WEEKDAYS.map((day) => (
                    <div
                        key={day}
                        className="text-center text-sm font-medium text-muted-foreground py-2"
                    >
                        {day}
                    </div>
                ))}
            </div>

            {/* Calendar Grid */}
            <AnimatePresence mode="wait" custom={direction}>
                <motion.div
                    key={getMonthKey(currentMonth)}
                    custom={direction}
                    variants={variants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ duration: 0.2, ease: "easeInOut" }}
                    className="grid grid-cols-7 gap-1"
                >
                    {days.map((day, index) => {
                        const dateKey = day.toISOString().split("T")[0];
                        const dayCompletions = completionsByDate[dateKey] || [];
                        const completionRate =
                            habits.length > 0
                                ? (dayCompletions.length / habits.length) * 100
                                : 0;

                        return (
                            <CalendarDay
                                key={index}
                                date={day}
                                currentMonth={currentMonth}
                                completions={dayCompletions}
                                completionRate={completionRate}
                                totalHabits={habits.length}
                                onClick={() => onDayClick(day)}
                            />
                        );
                    })}
                </motion.div>
            </AnimatePresence>

            {/* Legend */}
            {habits.length > 0 && (
                <div className="mt-6 pt-4 border-t flex flex-wrap gap-4">
                    {habits.map((habit) => (
                        <div key={habit.id} className="flex items-center gap-2 text-sm">
                            <div
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: habit.color || "#10b981" }}
                            />
                            <span className="text-muted-foreground">{habit.name}</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
