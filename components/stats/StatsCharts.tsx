"use client";

import { motion } from "framer-motion";
import { BarChart3, TrendingUp, Calendar, Award } from "lucide-react";

interface StatsData {
    totalHabits: number;
    todayCompleted: number;
    todayTotal: number;
    totalCurrentStreak: number;
    longestStreak: number;
    monthlyCompletionRate: number;
    weeklyData?: { day: string; completed: number; total: number }[];
    mostConsistentDay?: string;
}

interface StatsChartsProps {
    stats: StatsData;
}

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function StatsCharts({ stats }: StatsChartsProps) {
    // Generate sample weekly data if not provided
    const weeklyData = stats.weeklyData || DAYS.map((day, i) => ({
        day,
        completed: Math.floor(Math.random() * stats.totalHabits),
        total: stats.totalHabits,
    }));

    const maxCompleted = Math.max(...weeklyData.map((d) => d.total), 1);

    return (
        <div className="space-y-6">
            {/* Weekly Activity Chart */}
            <div className="bg-white rounded-xl border p-5">
                <div className="flex items-center gap-2 mb-4">
                    <BarChart3 className="h-5 w-5 text-violet-600" />
                    <h3 className="font-semibold text-gray-900">Weekly Activity</h3>
                </div>

                <div className="flex items-end justify-between gap-2 h-32">
                    {weeklyData.map((data, index) => {
                        const height = data.total > 0
                            ? (data.completed / data.total) * 100
                            : 0;

                        return (
                            <div key={index} className="flex-1 flex flex-col items-center gap-2">
                                <div className="w-full h-24 bg-gray-100 rounded-lg relative overflow-hidden">
                                    <motion.div
                                        initial={{ height: 0 }}
                                        animate={{ height: `${height}%` }}
                                        transition={{ delay: index * 0.1, duration: 0.5 }}
                                        className="absolute bottom-0 w-full bg-gradient-to-t from-violet-600 to-violet-400 rounded-lg"
                                    />
                                </div>
                                <span className="text-xs text-gray-500">{data.day}</span>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Insights */}
            <div className="grid grid-cols-2 gap-4">
                {/* Monthly Rate */}
                <div className="bg-white rounded-xl border p-4">
                    <div className="flex items-center gap-2 mb-2">
                        <Calendar className="h-4 w-4 text-blue-500" />
                        <span className="text-sm text-gray-500">This Month</span>
                    </div>
                    <div className="flex items-end gap-2">
                        <span className="text-2xl font-bold text-gray-900">
                            {stats.monthlyCompletionRate}%
                        </span>
                        <span className="text-sm text-gray-500 mb-1">completion</span>
                    </div>
                    <div className="mt-2 h-2 bg-gray-100 rounded-full overflow-hidden">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${stats.monthlyCompletionRate}%` }}
                            transition={{ duration: 0.5 }}
                            className="h-full bg-blue-500 rounded-full"
                        />
                    </div>
                </div>

                {/* Best Day */}
                <div className="bg-white rounded-xl border p-4">
                    <div className="flex items-center gap-2 mb-2">
                        <Award className="h-4 w-4 text-amber-500" />
                        <span className="text-sm text-gray-500">Most Consistent</span>
                    </div>
                    <span className="text-2xl font-bold text-gray-900">
                        {stats.mostConsistentDay || "Weekdays"}
                    </span>
                    <p className="text-xs text-gray-500 mt-1">
                        You complete most habits on this day
                    </p>
                </div>

                {/* Current Streak */}
                <div className="bg-white rounded-xl border p-4">
                    <div className="flex items-center gap-2 mb-2">
                        <TrendingUp className="h-4 w-4 text-emerald-500" />
                        <span className="text-sm text-gray-500">Current Streak</span>
                    </div>
                    <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-bold text-gray-900">
                            {stats.totalCurrentStreak}
                        </span>
                        <span className="text-sm text-gray-500">days total</span>
                    </div>
                </div>

                {/* Personal Best */}
                <div className="bg-white rounded-xl border p-4">
                    <div className="flex items-center gap-2 mb-2">
                        <Award className="h-4 w-4 text-violet-500" />
                        <span className="text-sm text-gray-500">Personal Best</span>
                    </div>
                    <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-bold text-gray-900">
                            {stats.longestStreak}
                        </span>
                        <span className="text-sm text-gray-500">day streak</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
