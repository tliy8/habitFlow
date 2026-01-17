"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Check, Flame, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface Habit {
    id: string;
    name: string;
    color: string;
    streak?: number;
}

interface TodayHabitsProps {
    habits: Habit[];
    completedIds: Set<string>;
    onToggle: (habitId: string) => void;
    onAddClick: () => void;
    isLoading?: Record<string, boolean>;
}

export default function TodayHabits({
    habits,
    completedIds,
    onToggle,
    onAddClick,
    isLoading = {},
}: TodayHabitsProps) {
    const completedCount = completedIds.size;
    const totalCount = habits.length;

    return (
        <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
            {/* Header */}
            <div className="px-5 py-4 border-b bg-gradient-to-r from-violet-50 to-purple-50 flex items-center justify-between">
                <div>
                    <h2 className="font-semibold text-gray-900">Today's Habits</h2>
                    <p className="text-sm text-gray-500">
                        {completedCount} of {totalCount} completed
                    </p>
                </div>
                <button
                    onClick={onAddClick}
                    className="p-2 bg-violet-600 hover:bg-violet-700 text-white rounded-xl transition-colors"
                >
                    <Plus className="h-5 w-5" />
                </button>
            </div>

            {/* Habits List */}
            <div className="divide-y">
                {habits.length === 0 ? (
                    <div className="p-8 text-center">
                        <div className="w-16 h-16 mx-auto mb-4 bg-violet-100 rounded-2xl flex items-center justify-center">
                            <Plus className="h-8 w-8 text-violet-600" />
                        </div>
                        <p className="text-gray-600 font-medium">No habits yet</p>
                        <p className="text-sm text-gray-500 mt-1">
                            Create your first habit to get started!
                        </p>
                    </div>
                ) : (
                    habits.map((habit, index) => {
                        const isCompleted = completedIds.has(habit.id);
                        const loading = isLoading[habit.id];

                        return (
                            <motion.button
                                key={habit.id}
                                onClick={() => onToggle(habit.id)}
                                disabled={loading}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className={cn(
                                    "w-full flex items-center gap-4 px-5 py-4 transition-all",
                                    "hover:bg-gray-50 active:bg-gray-100",
                                    isCompleted && "bg-emerald-50/50"
                                )}
                            >
                                {/* One-tap checkbox - LARGE touch target */}
                                <div
                                    className={cn(
                                        "w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0",
                                        "border-2 transition-all duration-200",
                                        isCompleted
                                            ? "border-transparent"
                                            : "border-gray-300 bg-white"
                                    )}
                                    style={{
                                        backgroundColor: isCompleted ? habit.color : undefined,
                                    }}
                                >
                                    <AnimatePresence mode="wait">
                                        {loading ? (
                                            <motion.div
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                exit={{ opacity: 0 }}
                                                className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"
                                            />
                                        ) : isCompleted ? (
                                            <motion.div
                                                initial={{ scale: 0, rotate: -45 }}
                                                animate={{ scale: 1, rotate: 0 }}
                                                exit={{ scale: 0 }}
                                                transition={{ type: "spring", damping: 15 }}
                                            >
                                                <Check className="h-5 w-5 text-white" />
                                            </motion.div>
                                        ) : null}
                                    </AnimatePresence>
                                </div>

                                {/* Habit name */}
                                <span
                                    className={cn(
                                        "flex-1 text-left font-medium transition-all",
                                        isCompleted ? "text-gray-400 line-through" : "text-gray-900"
                                    )}
                                >
                                    {habit.name}
                                </span>

                                {/* Streak badge (only if completed and has streak) */}
                                {isCompleted && habit.streak && habit.streak > 0 && (
                                    <motion.div
                                        initial={{ scale: 0, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        className="flex items-center gap-1 px-2 py-1 bg-orange-100 text-orange-600 rounded-full text-sm font-medium"
                                    >
                                        <Flame className="h-3.5 w-3.5" />
                                        <span>{habit.streak}</span>
                                    </motion.div>
                                )}

                                {/* Color indicator */}
                                <div
                                    className="w-3 h-3 rounded-full flex-shrink-0"
                                    style={{ backgroundColor: habit.color }}
                                />
                            </motion.button>
                        );
                    })
                )}
            </div>

            {/* Quick progress bar */}
            {habits.length > 0 && (
                <div className="px-5 py-3 bg-gray-50 border-t">
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${(completedCount / totalCount) * 100}%` }}
                            transition={{ duration: 0.3, ease: "easeOut" }}
                            className={cn(
                                "h-full rounded-full transition-colors",
                                completedCount === totalCount
                                    ? "bg-emerald-500"
                                    : "bg-violet-500"
                            )}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
