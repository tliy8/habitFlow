"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Check, Loader2, AlertTriangle, Clock, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format, isToday, isFuture, isPast } from "date-fns";
import { cn } from "@/lib/utils";

interface Habit {
    id: string;
    name: string;
    color?: string;
}

interface Completion {
    habitId: string;
}

interface DayDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    date: Date;
    habits: Habit[];
    completions: Completion[];
    onToggleHabit: (habitId: string, date: Date, completed: boolean, isBackfill: boolean) => Promise<void>;
}

export default function DayDetailModal({
    isOpen,
    onClose,
    date,
    habits,
    completions,
    onToggleHabit,
}: DayDetailModalProps) {
    const [loadingHabits, setLoadingHabits] = useState<Record<string, boolean>>({});
    const [localCompletions, setLocalCompletions] = useState<string[]>([]);
    const isUpdatingRef = useRef(false); // Track if we're in the middle of an update

    // Sync from props only when NOT in the middle of an update
    useEffect(() => {
        if (!isUpdatingRef.current) {
            setLocalCompletions(completions.map((c) => c.habitId));
        }
    }, [completions]);

    // Reset when modal opens
    useEffect(() => {
        if (isOpen) {
            setLocalCompletions(completions.map((c) => c.habitId));
            isUpdatingRef.current = false;
        }
    }, [isOpen, completions]);

    const isDateToday = isToday(date);
    const isDateFuture = isFuture(date);
    const isDatePast = isPast(date) && !isDateToday;

    const dateDisplay = format(date, "EEEE, MMMM d");
    const completedCount = localCompletions.length;
    const totalCount = habits.length;

    const handleToggle = async (habitId: string) => {
        if (isDateFuture) return;

        const isCompleted = localCompletions.includes(habitId);

        // Mark that we're updating - prevent useEffect from overriding
        isUpdatingRef.current = true;

        // Optimistic update
        setLocalCompletions((prev) =>
            isCompleted ? prev.filter((id) => id !== habitId) : [...prev, habitId]
        );
        setLoadingHabits((prev) => ({ ...prev, [habitId]: true }));

        try {
            await onToggleHabit(habitId, date, !isCompleted, isDatePast);
            // Keep optimistic state, server will sync on next refetch
        } catch (error) {
            console.error("Toggle error:", error);
            // Revert on error
            setLocalCompletions((prev) =>
                !isCompleted ? prev.filter((id) => id !== habitId) : [...prev, habitId]
            );
        } finally {
            setLoadingHabits((prev) => ({ ...prev, [habitId]: false }));
            // Allow syncing from props again after a short delay
            setTimeout(() => {
                isUpdatingRef.current = false;
            }, 500);
        }
    };

    // Determine status message
    const getStatusMessage = () => {
        if (isDateFuture) {
            return {
                icon: Clock,
                text: "You can plan ahead, but completion is only available on the day itself.",
                color: "text-gray-500 bg-gray-50",
            };
        }
        if (isDatePast) {
            return {
                icon: AlertTriangle,
                text: "You're viewing a past date. Changes here won't affect streaks.",
                color: "text-amber-600 bg-amber-50",
            };
        }
        return null;
    };

    const statusMessage = getStatusMessage();

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
                    />

                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 50 }}
                        transition={{ type: "spring", damping: 25 }}
                        className="fixed bottom-0 left-0 right-0 z-50 sm:bottom-auto sm:left-1/2 sm:top-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:max-w-md sm:w-full"
                    >
                        <div className="bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden">
                            {/* Header */}
                            <div className={cn(
                                "px-5 py-4 flex items-center justify-between border-b",
                                isDateToday && "bg-violet-50",
                                isDatePast && "bg-gray-50",
                                isDateFuture && "bg-gray-50"
                            )}>
                                <div className="flex items-center gap-3">
                                    <div className={cn(
                                        "p-2 rounded-lg",
                                        isDateToday ? "bg-violet-100" : "bg-gray-100"
                                    )}>
                                        <Calendar className={cn(
                                            "h-5 w-5",
                                            isDateToday ? "text-violet-600" : "text-gray-500"
                                        )} />
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-semibold text-gray-900">{dateDisplay}</h2>
                                        <p className={cn(
                                            "text-sm",
                                            isDateToday ? "text-violet-600 font-medium" : "text-gray-500"
                                        )}>
                                            {isDateToday ? "Today" : isDateFuture ? "Future" : "Past"}
                                        </p>
                                    </div>
                                </div>
                                <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600">
                                    <X className="h-5 w-5" />
                                </button>
                            </div>

                            {/* Status Message */}
                            {statusMessage && (
                                <div className={cn("px-5 py-3 flex items-start gap-3", statusMessage.color)}>
                                    <statusMessage.icon className="h-5 w-5 flex-shrink-0 mt-0.5" />
                                    <p className="text-sm">{statusMessage.text}</p>
                                </div>
                            )}

                            {/* Progress (only for today/past) */}
                            {!isDateFuture && totalCount > 0 && (
                                <div className="px-5 py-3 border-b bg-gray-50">
                                    <div className="flex items-center justify-between text-sm mb-2">
                                        <span className="text-gray-600">Progress</span>
                                        <span className="font-semibold text-gray-900">
                                            {completedCount}/{totalCount}
                                        </span>
                                    </div>
                                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                        <div
                                            className={cn(
                                                "h-full rounded-full",
                                                completedCount === totalCount ? "bg-emerald-500" : "bg-violet-500"
                                            )}
                                            style={{
                                                width: `${Math.round((completedCount / totalCount) * 100)}%`,
                                                minWidth: completedCount > 0 ? '8px' : '0px'
                                            }}
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Habits List */}
                            <div className="p-5 max-h-[50vh] overflow-y-auto">
                                {habits.length === 0 ? (
                                    <div className="text-center py-6 text-gray-500">
                                        <p>No habits scheduled</p>
                                    </div>
                                ) : isDateFuture ? (
                                    <div className="space-y-2">
                                        {habits.map((habit) => (
                                            <div
                                                key={habit.id}
                                                className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 opacity-60"
                                            >
                                                <div
                                                    className="w-5 h-5 rounded-full border-2 border-gray-300"
                                                />
                                                <span className="text-gray-500">{habit.name}</span>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        {habits.map((habit) => {
                                            const isCompleted = localCompletions.includes(habit.id);
                                            const isLoading = loadingHabits[habit.id];

                                            return (
                                                <motion.button
                                                    key={habit.id}
                                                    onClick={() => handleToggle(habit.id)}
                                                    disabled={isLoading}
                                                    whileTap={{ scale: 0.98 }}
                                                    className={cn(
                                                        "w-full flex items-center gap-3 p-4 rounded-xl transition-all",
                                                        isCompleted
                                                            ? "bg-emerald-50 border-2 border-emerald-200"
                                                            : "bg-gray-50 border-2 border-transparent hover:border-violet-200"
                                                    )}
                                                >
                                                    {/* Checkbox */}
                                                    <div
                                                        className={cn(
                                                            "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all",
                                                            isCompleted ? "border-transparent" : "border-gray-300"
                                                        )}
                                                        style={{
                                                            backgroundColor: isCompleted ? habit.color || "#10b981" : "transparent",
                                                        }}
                                                    >
                                                        {isLoading ? (
                                                            <Loader2 className={cn("h-4 w-4 animate-spin", isCompleted ? "text-white" : "text-violet-500")} />
                                                        ) : isCompleted ? (
                                                            <Check className="h-4 w-4 text-white" />
                                                        ) : null}
                                                    </div>

                                                    {/* Name */}
                                                    <span className={cn(
                                                        "flex-1 text-left font-medium",
                                                        isCompleted && "text-gray-500 line-through"
                                                    )}>
                                                        {habit.name}
                                                    </span>

                                                    {/* Color dot */}
                                                    <div
                                                        className="w-3 h-3 rounded-full"
                                                        style={{ backgroundColor: habit.color || "#10b981" }}
                                                    />
                                                </motion.button>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>

                            {/* Footer */}
                            <div className="px-5 py-4 border-t bg-gray-50">
                                <Button onClick={onClose} className="w-full" variant="outline">
                                    Done
                                </Button>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
