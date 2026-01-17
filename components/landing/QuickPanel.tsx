"use client";

import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Check, Loader2, Sparkles } from "lucide-react";
import { format, parseISO } from "date-fns";
import { cn } from "@/lib/utils";

interface Habit {
    id: string;
    name: string;
    color: string;
}

interface QuickPanelProps {
    isOpen: boolean;
    onClose: () => void;
    date: string | null;
    habits: Habit[];
    completedHabits: Set<string>;
    onToggle: (habitId: string) => void;
    reducedMotion: boolean;
}

export default function QuickPanel({
    isOpen,
    onClose,
    date,
    habits,
    completedHabits,
    onToggle,
    reducedMotion,
}: QuickPanelProps) {
    const panelRef = useRef<HTMLDivElement>(null);

    // Close on escape
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        if (isOpen) {
            document.addEventListener("keydown", handleEscape);
            // Focus trap - focus first item
            setTimeout(() => {
                panelRef.current?.querySelector("button")?.focus();
            }, 100);
        }
        return () => document.removeEventListener("keydown", handleEscape);
    }, [isOpen, onClose]);

    const dateObj = date ? parseISO(date) : new Date();
    const completedCount = completedHabits.size;
    const allComplete = completedCount === habits.length && habits.length > 0;

    // Get status message
    const getStatusMessage = () => {
        if (allComplete) return "Perfect day — nice work 🎉";
        if (completedCount > 0) return `Great progress! ${completedCount}/${habits.length} done 💪`;
        return "Let's start building! ✨";
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
                        aria-hidden="true"
                    />

                    {/* Panel */}
                    <motion.div
                        ref={panelRef}
                        initial={reducedMotion ? { opacity: 0 } : { opacity: 0, x: "100%" }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={reducedMotion ? { opacity: 0 } : { opacity: 0, x: "100%" }}
                        transition={{ type: reducedMotion ? "tween" : "spring", damping: 25, stiffness: 300 }}
                        className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl z-50 flex flex-col"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="panel-title"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between px-6 py-4 border-b">
                            <div>
                                <h2 id="panel-title" className="text-lg font-semibold text-gray-900">
                                    {format(dateObj, "EEEE, MMMM d")}
                                </h2>
                                <p className="text-sm text-gray-500">Demo Mode</p>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-violet-500"
                                aria-label="Close panel"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        {/* Status */}
                        <div className={cn(
                            "px-6 py-4 transition-colors",
                            allComplete ? "bg-emerald-50" : "bg-violet-50"
                        )}>
                            <div className="flex items-center gap-3">
                                {allComplete && (
                                    <motion.div
                                        initial={reducedMotion ? {} : { scale: 0 }}
                                        animate={{ scale: 1 }}
                                        className="p-2 bg-emerald-100 rounded-full"
                                    >
                                        <Sparkles className="h-5 w-5 text-emerald-600" />
                                    </motion.div>
                                )}
                                <p className={cn(
                                    "font-medium",
                                    allComplete ? "text-emerald-700" : "text-violet-700"
                                )}>
                                    {getStatusMessage()}
                                </p>
                            </div>

                            {/* Progress bar */}
                            <div className="mt-3 h-2 bg-white/50 rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${(completedCount / habits.length) * 100}%` }}
                                    transition={{ duration: reducedMotion ? 0.2 : 0.5, ease: "easeOut" }}
                                    className={cn(
                                        "h-full rounded-full",
                                        allComplete ? "bg-emerald-500" : "bg-violet-500"
                                    )}
                                />
                            </div>
                        </div>

                        {/* Habits list */}
                        <div className="flex-1 overflow-y-auto px-6 py-4">
                            <p className="text-sm text-gray-500 mb-4">
                                Toggle habits to simulate completion:
                            </p>

                            <div className="space-y-3">
                                {habits.map((habit, index) => {
                                    const isCompleted = completedHabits.has(habit.id);

                                    return (
                                        <motion.button
                                            key={habit.id}
                                            onClick={() => onToggle(habit.id)}
                                            initial={reducedMotion ? {} : { opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: reducedMotion ? 0 : index * 0.05 }}
                                            whileTap={reducedMotion ? {} : { scale: 0.98 }}
                                            className={cn(
                                                "w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left",
                                                "focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2",
                                                isCompleted
                                                    ? "bg-emerald-50 border-emerald-200"
                                                    : "bg-gray-50 border-transparent hover:border-violet-200"
                                            )}
                                            aria-pressed={isCompleted}
                                        >
                                            {/* Animated checkbox */}
                                            <div
                                                className={cn(
                                                    "w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all flex-shrink-0",
                                                    isCompleted ? "border-transparent" : "border-gray-300"
                                                )}
                                                style={{
                                                    backgroundColor: isCompleted ? habit.color : "transparent",
                                                }}
                                            >
                                                {isCompleted && (
                                                    <motion.div
                                                        initial={reducedMotion ? {} : { scale: 0, rotate: -45 }}
                                                        animate={{ scale: 1, rotate: 0 }}
                                                        transition={{ type: "spring", damping: 15, stiffness: 400 }}
                                                    >
                                                        <Check className="h-4 w-4 text-white" strokeWidth={3} />
                                                    </motion.div>
                                                )}
                                            </div>

                                            {/* Habit name */}
                                            <span className={cn(
                                                "flex-1 font-medium",
                                                isCompleted && "text-gray-500 line-through"
                                            )}>
                                                {habit.name}
                                            </span>

                                            {/* Color dot */}
                                            <div
                                                className="w-3 h-3 rounded-full flex-shrink-0"
                                                style={{ backgroundColor: habit.color }}
                                            />
                                        </motion.button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="px-6 py-4 border-t bg-gray-50">
                            <p className="text-sm text-gray-600 text-center">
                                This is a demo. <a href="/register" className="text-violet-600 hover:text-violet-700 font-medium">Sign up</a> to track your real habits!
                            </p>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
