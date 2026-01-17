"use client";

import { motion } from "framer-motion";
import { Flame, Trophy, Shield } from "lucide-react";

interface StreakCardProps {
    currentStreak: number;
    bestStreak: number;
    graceUsed: number;
    graceTotal: number; // Usually 2
}

export default function StreakCard({
    currentStreak,
    bestStreak,
    graceUsed,
    graceTotal,
}: StreakCardProps) {
    const graceRemaining = graceTotal - graceUsed;
    const isBestStreak = currentStreak >= bestStreak && currentStreak > 0;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl border shadow-sm p-5"
        >
            {/* Current Streak */}
            <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-orange-100 rounded-xl">
                    <Flame className="h-6 w-6 text-orange-500" />
                </div>
                <div>
                    <div className="flex items-baseline gap-2">
                        <motion.span
                            key={currentStreak}
                            initial={{ scale: 1.2 }}
                            animate={{ scale: 1 }}
                            className="text-3xl font-bold text-gray-900"
                        >
                            {currentStreak}
                        </motion.span>
                        <span className="text-gray-500">day streak</span>
                    </div>
                    {isBestStreak && currentStreak > 0 && (
                        <div className="flex items-center gap-1 text-amber-600 text-sm font-medium">
                            <Trophy className="h-4 w-4" />
                            Personal best!
                        </div>
                    )}
                </div>
            </div>

            {/* Best Streak */}
            {!isBestStreak && bestStreak > 0 && (
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                    <Trophy className="h-4 w-4" />
                    <span>Best: {bestStreak} days</span>
                </div>
            )}

            {/* Grace Days Indicator */}
            <div className="pt-4 border-t">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Shield className="h-4 w-4 text-violet-500" />
                        <span className="text-sm text-gray-600">Grace days</span>
                    </div>
                    <div className="flex items-center gap-1">
                        {Array.from({ length: graceTotal }).map((_, i) => (
                            <motion.div
                                key={i}
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: i * 0.1 }}
                                className={`w-3 h-3 rounded-full ${i < graceRemaining
                                        ? "bg-violet-500"
                                        : "bg-gray-200"
                                    }`}
                                title={i < graceRemaining ? "Available" : "Used"}
                            />
                        ))}
                    </div>
                </div>
                <p className="text-xs text-gray-400 mt-2">
                    {graceRemaining > 0
                        ? `${graceRemaining} grace day${graceRemaining > 1 ? "s" : ""} protect your streak this week`
                        : "Grace days reset on Monday"
                    }
                </p>
            </div>
        </motion.div>
    );
}
