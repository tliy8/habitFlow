"use client";

import { motion } from "framer-motion";
import { Flame, Trophy, TrendingUp, Target } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatsOverview {
    totalHabits: number;
    todayCompleted: number;
    todayTotal: number;
    totalCurrentStreak: number;
    longestStreak: number;
    monthlyCompletionRate: number;
}

interface StatsPanelProps {
    stats: StatsOverview | null;
    isLoading?: boolean;
}

export default function StatsPanel({ stats, isLoading }: StatsPanelProps) {
    if (isLoading) {
        return (
            <div className="grid grid-cols-2 gap-4">
                {[...Array(4)].map((_, i) => (
                    <div
                        key={i}
                        className="h-24 bg-muted/50 rounded-xl animate-pulse"
                    />
                ))}
            </div>
        );
    }

    if (!stats) {
        return null;
    }

    const statCards = [
        {
            label: "Today's Progress",
            value: `${stats.todayCompleted}/${stats.todayTotal}`,
            subtext: stats.todayTotal > 0
                ? `${Math.round((stats.todayCompleted / stats.todayTotal) * 100)}% complete`
                : "No habits yet",
            icon: Target,
            color: "from-blue-500 to-blue-600",
            bgColor: "bg-blue-500/10",
        },
        {
            label: "Current Streak",
            value: `${stats.totalCurrentStreak}`,
            subtext: "days total",
            icon: Flame,
            color: "from-orange-500 to-red-500",
            bgColor: "bg-orange-500/10",
        },
        {
            label: "Best Streak",
            value: `${stats.longestStreak}`,
            subtext: "personal best",
            icon: Trophy,
            color: "from-amber-500 to-yellow-500",
            bgColor: "bg-amber-500/10",
        },
        {
            label: "This Month",
            value: `${stats.monthlyCompletionRate}%`,
            subtext: "completion rate",
            icon: TrendingUp,
            color: "from-emerald-500 to-green-500",
            bgColor: "bg-emerald-500/10",
        },
    ];

    return (
        <div className="grid grid-cols-2 gap-4">
            {statCards.map((stat, index) => {
                const Icon = stat.icon;
                return (
                    <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className={cn(
                            "relative overflow-hidden rounded-xl p-4",
                            "bg-card border shadow-sm",
                            "hover:shadow-md transition-shadow"
                        )}
                    >
                        {/* Background Gradient */}
                        <div
                            className={cn(
                                "absolute inset-0 opacity-5",
                                `bg-gradient-to-br ${stat.color}`
                            )}
                        />

                        {/* Icon */}
                        <div
                            className={cn(
                                "w-10 h-10 rounded-lg flex items-center justify-center mb-3",
                                stat.bgColor
                            )}
                        >
                            <Icon className={cn("h-5 w-5", `text-${stat.color.split("-")[1]}-500`)} />
                        </div>

                        {/* Value */}
                        <div className="relative">
                            <p className="text-2xl font-bold">{stat.value}</p>
                            <p className="text-sm text-muted-foreground mt-0.5">
                                {stat.subtext}
                            </p>
                            <p className="text-xs text-muted-foreground/70 mt-1">
                                {stat.label}
                            </p>
                        </div>
                    </motion.div>
                );
            })}
        </div>
    );
}
