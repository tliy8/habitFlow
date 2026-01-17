"use client";

import { motion } from "framer-motion";
import { format } from "date-fns";
import { Sparkles, Sun, Moon, Clock } from "lucide-react";

interface TodayHeroProps {
    completedCount: number;
    totalCount: number;
    userName?: string;
}

// Get time-appropriate greeting
function getGreeting(): { text: string; icon: typeof Sun } {
    const hour = new Date().getHours();
    if (hour < 12) return { text: "Good morning", icon: Sun };
    if (hour < 17) return { text: "Good afternoon", icon: Sun };
    return { text: "Good evening", icon: Moon };
}

// Get motivational message based on progress
function getMessage(completed: number, total: number): string {
    if (total === 0) return "Add your first habit to begin your journey ✨";

    const progress = total > 0 ? (completed / total) * 100 : 0;
    const hour = new Date().getHours();

    if (progress === 100) return "Perfect day — nice work 🎉";
    if (progress >= 75) return "Almost there! Final push 💪";
    if (progress >= 50) return "Strong progress! Keep going 🔥";
    if (progress >= 25) return "You've started. That's what matters.";
    if (progress > 0) return "One step at a time 🌱";

    // 0% progress
    if (hour < 12) return "Ready when you are ☀️";
    if (hour < 18) return "Still plenty of time today";
    return "There's still time. You've got this.";
}

export default function TodayHero({
    completedCount,
    totalCount,
    userName,
}: TodayHeroProps) {
    const { text: greeting, icon: GreetingIcon } = getGreeting();
    const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;
    const message = getMessage(completedCount, totalCount);
    const isComplete = progress === 100;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`
        rounded-2xl p-6 transition-colors
        ${isComplete
                    ? "bg-gradient-to-br from-emerald-50 to-green-50 border-2 border-emerald-200"
                    : "bg-white border shadow-sm"
                }
      `}
        >
            {/* Greeting */}
            <div className="flex items-center gap-2 mb-4">
                <GreetingIcon className="h-5 w-5 text-amber-500" />
                <span className="text-gray-600">
                    {greeting}{userName ? `, ${userName}` : ""}
                </span>
            </div>

            {/* Date */}
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
                {format(new Date(), "EEEE, MMMM d")}
            </h1>

            {/* Progress */}
            <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">
                        {completedCount} of {totalCount} completed
                    </span>
                    <span className="text-sm font-semibold text-gray-900">
                        {Math.round(progress)}%
                    </span>
                </div>

                {/* Progress bar */}
                <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                        className={`h-full rounded-full ${isComplete ? "bg-emerald-500" : "bg-violet-500"
                            }`}
                    />
                </div>
            </div>

            {/* Motivational message */}
            <motion.p
                key={message}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className={`text-lg font-medium ${isComplete ? "text-emerald-700" : "text-gray-700"
                    }`}
            >
                {isComplete && <Sparkles className="inline h-5 w-5 mr-1" />}
                {message}
            </motion.p>
        </motion.div>
    );
}
