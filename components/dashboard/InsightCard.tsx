"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { Lightbulb, TrendingUp, Clock, Calendar } from "lucide-react";

interface InsightCardProps {
    completions: { date: string; habitId: string }[];
    habits: { id: string; name: string }[];
}

// Generate a simple insight from data
function generateInsight(
    completions: { date: string; habitId: string }[],
    habits: { id: string; name: string }[]
): { icon: typeof Lightbulb; text: string; color: string } {
    if (habits.length === 0) {
        return {
            icon: Lightbulb,
            text: "Add habits to start tracking your progress",
            color: "violet",
        };
    }

    if (completions.length === 0) {
        return {
            icon: Lightbulb,
            text: "Complete your first habit to unlock insights",
            color: "violet",
        };
    }

    // Count completions per habit
    const habitCounts = new Map<string, number>();
    habits.forEach((h) => habitCounts.set(h.id, 0));
    completions.forEach((c) => {
        const current = habitCounts.get(c.habitId) || 0;
        habitCounts.set(c.habitId, current + 1);
    });

    // Find best performing habit
    let bestHabit = habits[0];
    let bestCount = 0;
    habitCounts.forEach((count, habitId) => {
        if (count > bestCount) {
            bestCount = count;
            const habit = habits.find((h) => h.id === habitId);
            if (habit) bestHabit = habit;
        }
    });

    // Different insight types
    const insights = [
        {
            icon: TrendingUp,
            text: `"${bestHabit.name}" is your most consistent habit`,
            color: "emerald",
        },
        {
            icon: Calendar,
            text: `You've logged ${completions.length} completions total`,
            color: "violet",
        },
        {
            icon: Clock,
            text: "Consistency beats perfection. Keep showing up!",
            color: "amber",
        },
    ];

    // Rotate based on day
    const dayOfMonth = new Date().getDate();
    return insights[dayOfMonth % insights.length];
}

export default function InsightCard({ completions, habits }: InsightCardProps) {
    const insight = useMemo(
        () => generateInsight(completions, habits),
        [completions, habits]
    );

    const Icon = insight.icon;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className={`rounded-xl p-5 ${insight.color === "emerald"
                    ? "bg-emerald-50 border border-emerald-100"
                    : insight.color === "amber"
                        ? "bg-amber-50 border border-amber-100"
                        : "bg-violet-50 border border-violet-100"
                }`}
        >
            <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg ${insight.color === "emerald"
                        ? "bg-emerald-100"
                        : insight.color === "amber"
                            ? "bg-amber-100"
                            : "bg-violet-100"
                    }`}>
                    <Icon className={`h-5 w-5 ${insight.color === "emerald"
                            ? "text-emerald-600"
                            : insight.color === "amber"
                                ? "text-amber-600"
                                : "text-violet-600"
                        }`} />
                </div>
                <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-1">Insight</h4>
                    <p className={`font-medium ${insight.color === "emerald"
                            ? "text-emerald-800"
                            : insight.color === "amber"
                                ? "text-amber-800"
                                : "text-violet-800"
                        }`}>
                        {insight.text}
                    </p>
                </div>
            </div>
        </motion.div>
    );
}
