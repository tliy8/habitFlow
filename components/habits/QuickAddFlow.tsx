"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronRight, Sparkles, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";

interface QuickAddFlowProps {
    isOpen: boolean;
    onClose: () => void;
    onCreate: (data: {
        name: string;
        frequency: "daily" | "weekly";
        weeklyDays?: string; // JSON stringified array
        color: string;
    }) => Promise<void>;
}

const SUGGESTIONS = [
    "Morning Run",
    "Read 30 min",
    "Meditate",
    "Drink Water",
    "Exercise",
    "Journal",
    "No Social Media",
    "Sleep by 11pm",
];

const COLORS = [
    "#10b981", // emerald
    "#3b82f6", // blue
    "#8b5cf6", // violet
    "#f59e0b", // amber
    "#ef4444", // red
    "#ec4899", // pink
];

const DAYS = ["S", "M", "T", "W", "T", "F", "S"];

export default function QuickAddFlow({ isOpen, onClose, onCreate }: QuickAddFlowProps) {
    const [step, setStep] = useState(1);
    const [name, setName] = useState("");
    const [frequency, setFrequency] = useState<"daily" | "weekly">("daily");
    const [weeklyDays, setWeeklyDays] = useState([1, 2, 3, 4, 5]);
    const [color, setColor] = useState(COLORS[0]);
    const [isCreating, setIsCreating] = useState(false);

    const reset = () => {
        setStep(1);
        setName("");
        setFrequency("daily");
        setWeeklyDays([1, 2, 3, 4, 5]);
        setColor(COLORS[0]);
    };

    const handleCreate = async () => {
        if (!name.trim()) return;
        setIsCreating(true);
        try {
            await onCreate({
                name: name.trim(),
                frequency,
                weeklyDays: frequency === "weekly" ? JSON.stringify(weeklyDays) : undefined,
                color,
            });
            reset();
            onClose();
        } finally {
            setIsCreating(false);
        }
    };

    const handleClose = () => {
        reset();
        onClose();
    };

    const toggleDay = (day: number) => {
        setWeeklyDays((prev) =>
            prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day].sort()
        );
    };

    const canProceed = step === 1 ? name.trim().length > 0 : true;

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={handleClose}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="fixed bottom-0 left-0 right-0 z-50 sm:bottom-auto sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:max-w-md sm:w-full"
                    >
                        <div className="bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden">
                            {/* Header */}
                            <div className="px-5 py-4 border-b flex items-center justify-between bg-gradient-to-r from-violet-50 to-purple-50">
                                <div className="flex items-center gap-2">
                                    <Sparkles className="h-5 w-5 text-violet-600" />
                                    <h2 className="font-semibold text-gray-900">New Habit</h2>
                                </div>
                                <button onClick={handleClose} className="p-1 hover:bg-gray-200 rounded-full">
                                    <X className="h-5 w-5 text-gray-500" />
                                </button>
                            </div>

                            {/* Steps indicator */}
                            <div className="px-5 py-3 flex gap-2">
                                {[1, 2, 3].map((s) => (
                                    <div
                                        key={s}
                                        className={`h-1 flex-1 rounded-full transition-colors ${s <= step ? "bg-violet-500" : "bg-gray-200"
                                            }`}
                                    />
                                ))}
                            </div>

                            {/* Content */}
                            <div className="p-5 min-h-[250px]">
                                <AnimatePresence mode="wait">
                                    {step === 1 && (
                                        <motion.div
                                            key="step1"
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: -20 }}
                                            className="space-y-4"
                                        >
                                            <h3 className="text-lg font-medium text-gray-900">
                                                What habit do you want to build?
                                            </h3>
                                            <Input
                                                value={name}
                                                onChange={(e) => setName(e.target.value)}
                                                placeholder="e.g., Morning Run"
                                                className="h-12 text-base"
                                                autoFocus
                                            />
                                            <div className="space-y-2">
                                                <p className="text-sm text-gray-500">Popular habits:</p>
                                                <div className="flex flex-wrap gap-2">
                                                    {SUGGESTIONS.slice(0, 6).map((s) => (
                                                        <button
                                                            key={s}
                                                            onClick={() => setName(s)}
                                                            className={`px-3 py-1.5 text-sm rounded-full transition-colors ${name === s
                                                                ? "bg-violet-600 text-white"
                                                                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                                                }`}
                                                        >
                                                            {s}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}

                                    {step === 2 && (
                                        <motion.div
                                            key="step2"
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: -20 }}
                                            className="space-y-4"
                                        >
                                            <h3 className="text-lg font-medium text-gray-900">
                                                How often?
                                            </h3>
                                            <div className="flex gap-3">
                                                <button
                                                    onClick={() => setFrequency("daily")}
                                                    className={`flex-1 py-4 rounded-xl font-medium transition-all ${frequency === "daily"
                                                        ? "bg-violet-600 text-white shadow-lg"
                                                        : "bg-gray-100 text-gray-700"
                                                        }`}
                                                >
                                                    Daily
                                                </button>
                                                <button
                                                    onClick={() => setFrequency("weekly")}
                                                    className={`flex-1 py-4 rounded-xl font-medium transition-all ${frequency === "weekly"
                                                        ? "bg-violet-600 text-white shadow-lg"
                                                        : "bg-gray-100 text-gray-700"
                                                        }`}
                                                >
                                                    Weekly
                                                </button>
                                            </div>

                                            {frequency === "weekly" && (
                                                <motion.div
                                                    initial={{ opacity: 0, height: 0 }}
                                                    animate={{ opacity: 1, height: "auto" }}
                                                    className="space-y-2"
                                                >
                                                    <p className="text-sm text-gray-500">Select days:</p>
                                                    <div className="flex gap-2 justify-center">
                                                        {DAYS.map((day, i) => (
                                                            <button
                                                                key={i}
                                                                onClick={() => toggleDay(i)}
                                                                className={`w-10 h-10 rounded-full font-medium transition-all ${weeklyDays.includes(i)
                                                                    ? "bg-violet-600 text-white"
                                                                    : "bg-gray-100 text-gray-500"
                                                                    }`}
                                                            >
                                                                {day}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </motion.div>
                                            )}
                                        </motion.div>
                                    )}

                                    {step === 3 && (
                                        <motion.div
                                            key="step3"
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: -20 }}
                                            className="space-y-4"
                                        >
                                            <h3 className="text-lg font-medium text-gray-900">
                                                Pick a color
                                            </h3>
                                            <div className="flex gap-3 justify-center py-4">
                                                {COLORS.map((c) => (
                                                    <button
                                                        key={c}
                                                        onClick={() => setColor(c)}
                                                        className={`w-12 h-12 rounded-xl transition-all ${color === c ? "ring-4 ring-offset-2 ring-gray-400 scale-110" : ""
                                                            }`}
                                                        style={{ backgroundColor: c }}
                                                    />
                                                ))}
                                            </div>

                                            {/* Preview */}
                                            <div className="p-4 bg-gray-50 rounded-xl">
                                                <p className="text-sm text-gray-500 mb-2">Preview:</p>
                                                <div className="flex items-center gap-3">
                                                    <div
                                                        className="w-8 h-8 rounded-lg"
                                                        style={{ backgroundColor: color }}
                                                    />
                                                    <span className="font-medium text-gray-900">{name}</span>
                                                    <span className="text-sm text-gray-500">
                                                        • {frequency === "daily" ? "Daily" : `${weeklyDays.length} days/week`}
                                                    </span>
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            {/* Footer */}
                            <div className="px-5 py-4 border-t flex gap-3">
                                {step > 1 && (
                                    <button
                                        onClick={() => setStep(step - 1)}
                                        className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-xl"
                                    >
                                        Back
                                    </button>
                                )}
                                <button
                                    onClick={step < 3 ? () => setStep(step + 1) : handleCreate}
                                    disabled={!canProceed || isCreating}
                                    className="flex-1 py-3 bg-violet-600 hover:bg-violet-700 text-white font-semibold rounded-xl flex items-center justify-center gap-2 disabled:opacity-50"
                                >
                                    {isCreating ? (
                                        <Loader2 className="h-5 w-5 animate-spin" />
                                    ) : step < 3 ? (
                                        <>
                                            Next
                                            <ChevronRight className="h-5 w-5" />
                                        </>
                                    ) : (
                                        "Create Habit"
                                    )}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
