"use client";

import { motion } from "framer-motion";
import { Trophy, Target, Flame, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface Goal {
    id: string;
    type: string;
    targetDays: number;
    achieved: boolean;
    habit: {
        id: string;
        name: string;
        color: string;
    };
}

interface GoalCardProps {
    goal: Goal;
    progress: number; // Current streak/days completed
}

export default function GoalCard({ goal, progress }: GoalCardProps) {
    const percentage = Math.min((progress / goal.targetDays) * 100, 100);
    const isComplete = goal.achieved || percentage >= 100;

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
                "p-4 rounded-xl border transition-all",
                isComplete
                    ? "bg-gradient-to-br from-emerald-50 to-green-50 border-emerald-200"
                    : "bg-white border-gray-200 hover:border-violet-200"
            )}
        >
            <div className="flex items-start gap-3">
                <div
                    className={cn(
                        "p-2 rounded-lg",
                        isComplete ? "bg-emerald-100" : "bg-violet-100"
                    )}
                >
                    {isComplete ? (
                        <Trophy className="h-5 w-5 text-emerald-600" />
                    ) : (
                        <Target className="h-5 w-5 text-violet-600" />
                    )}
                </div>

                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                        <span
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: goal.habit.color }}
                        />
                        <span className="text-sm font-medium text-gray-900 truncate">
                            {goal.habit.name}
                        </span>
                    </div>

                    <p className="text-xs text-gray-500 mb-2">
                        {goal.targetDays}-day {goal.type} goal
                    </p>

                    {/* Progress Bar */}
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${percentage}%` }}
                            transition={{ duration: 0.5, ease: "easeOut" }}
                            className={cn(
                                "h-full rounded-full",
                                isComplete ? "bg-emerald-500" : "bg-violet-500"
                            )}
                        />
                    </div>

                    <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-gray-500">
                            {progress} / {goal.targetDays} days
                        </span>
                        <span
                            className={cn(
                                "text-xs font-medium",
                                isComplete ? "text-emerald-600" : "text-gray-600"
                            )}
                        >
                            {Math.round(percentage)}%
                        </span>
                    </div>
                </div>

                {isComplete && (
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 500 }}
                        className="flex items-center justify-center w-6 h-6 bg-emerald-500 rounded-full"
                    >
                        <Check className="h-4 w-4 text-white" />
                    </motion.div>
                )}
            </div>
        </motion.div>
    );
}
