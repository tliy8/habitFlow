"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Target, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Habit {
    id: string;
    name: string;
    color: string;
}

interface CreateGoalModalProps {
    habits: Habit[];
    isOpen: boolean;
    onClose: () => void;
    onCreateGoal: (habitId: string, targetDays: number) => Promise<void>;
}

const PRESET_GOALS = [
    { days: 7, label: "1 Week" },
    { days: 14, label: "2 Weeks" },
    { days: 30, label: "1 Month" },
    { days: 60, label: "2 Months" },
    { days: 90, label: "3 Months" },
];

export default function CreateGoalModal({
    habits,
    isOpen,
    onClose,
    onCreateGoal,
}: CreateGoalModalProps) {
    const [selectedHabit, setSelectedHabit] = useState<string>("");
    const [targetDays, setTargetDays] = useState(30);
    const [isCreating, setIsCreating] = useState(false);

    const handleCreate = async () => {
        if (!selectedHabit) return;
        setIsCreating(true);
        try {
            await onCreateGoal(selectedHabit, targetDays);
            onClose();
        } finally {
            setIsCreating(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md"
                    >
                        <div className="bg-white rounded-2xl shadow-2xl border overflow-hidden">
                            <div className="flex items-center justify-between px-6 py-4 border-b bg-gray-50">
                                <div className="flex items-center gap-2">
                                    <Target className="h-5 w-5 text-violet-600" />
                                    <h2 className="text-lg font-semibold text-gray-900">Set a Goal</h2>
                                </div>
                                <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                                    <X className="h-5 w-5" />
                                </button>
                            </div>

                            <div className="p-6 space-y-5">
                                {/* Habit Selection */}
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700">
                                        Select Habit
                                    </label>
                                    <div className="grid grid-cols-2 gap-2">
                                        {habits.map((habit) => (
                                            <button
                                                key={habit.id}
                                                onClick={() => setSelectedHabit(habit.id)}
                                                className={`flex items-center gap-2 p-3 rounded-lg border-2 transition-all ${selectedHabit === habit.id
                                                        ? "border-violet-500 bg-violet-50"
                                                        : "border-gray-200 hover:border-gray-300"
                                                    }`}
                                            >
                                                <span
                                                    className="w-3 h-3 rounded-full"
                                                    style={{ backgroundColor: habit.color }}
                                                />
                                                <span className="text-sm font-medium truncate">
                                                    {habit.name}
                                                </span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Target Days */}
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700">
                                        Streak Goal
                                    </label>
                                    <div className="flex flex-wrap gap-2">
                                        {PRESET_GOALS.map((preset) => (
                                            <button
                                                key={preset.days}
                                                onClick={() => setTargetDays(preset.days)}
                                                className={`px-4 py-2 rounded-lg border-2 text-sm font-medium transition-all ${targetDays === preset.days
                                                        ? "border-violet-500 bg-violet-50 text-violet-700"
                                                        : "border-gray-200 text-gray-600 hover:border-gray-300"
                                                    }`}
                                            >
                                                {preset.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 px-6 py-4 border-t bg-gray-50">
                                <Button variant="outline" onClick={onClose}>
                                    Cancel
                                </Button>
                                <button
                                    onClick={handleCreate}
                                    disabled={!selectedHabit || isCreating}
                                    className="flex items-center gap-2 px-5 py-2.5 bg-violet-600 text-white rounded-lg font-medium hover:bg-violet-700 disabled:opacity-50 transition-colors"
                                >
                                    {isCreating && <Loader2 className="h-4 w-4 animate-spin" />}
                                    Create Goal
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
