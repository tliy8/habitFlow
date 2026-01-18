"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Plus, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { format } from "date-fns";

interface QuickAddHabitProps {
    isOpen: boolean;
    onClose: () => void;
    onCreate: (habit: {
        name: string;
        frequency: "daily" | "weekly";
        startDate: string;
        weeklyDays?: string; // Corrected type: expect JSON string
        description?: string;
        color?: string;
    }) => Promise<void>;
    initialDate?: Date; // If creating from calendar date click
}

const DAYS = ["S", "M", "T", "W", "T", "F", "S"];
const COLORS = ["#8b5cf6", "#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#ec4899"];

export default function QuickAddHabit({
    isOpen,
    onClose,
    onCreate,
    initialDate,
}: QuickAddHabitProps) {
    const [name, setName] = useState("");
    const [frequency, setFrequency] = useState<"daily" | "weekly">("daily");
    const [weeklyDays, setWeeklyDays] = useState<number[]>([1, 2, 3, 4, 5]); // Mon-Fri default
    const [startDate, setStartDate] = useState(
        format(initialDate || new Date(), "yyyy-MM-dd")
    );
    const [showOptional, setShowOptional] = useState(false);
    const [description, setDescription] = useState("");
    const [color, setColor] = useState(COLORS[0]);
    const [isCreating, setIsCreating] = useState(false);

    const handleCreate = async () => {
        if (!name.trim()) return;
        setIsCreating(true);
        try {
            await onCreate({
                name: name.trim(),
                frequency,
                startDate,
                weeklyDays: frequency === "weekly" ? JSON.stringify(weeklyDays) : undefined,
                description: description.trim() || undefined,
                color,
            });
            // Reset form
            setName("");
            setDescription("");
            setShowOptional(false);
            onClose();
        } finally {
            setIsCreating(false);
        }
    };

    const toggleDay = (day: number) => {
        setWeeklyDays((prev) =>
            prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day].sort()
        );
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
                        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
                    />
                    <motion.div
                        initial={{ opacity: 0, y: 100 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 100 }}
                        transition={{ type: "spring", damping: 25 }}
                        className="fixed bottom-0 left-0 right-0 z-50 sm:bottom-auto sm:left-1/2 sm:top-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:max-w-md sm:w-full"
                    >
                        <div className="bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden">
                            {/* Header */}
                            <div className="flex items-center justify-between px-5 py-4 border-b">
                                <h2 className="text-lg font-semibold text-gray-900">New Habit</h2>
                                <button
                                    onClick={onClose}
                                    className="p-1 text-gray-400 hover:text-gray-600 rounded-full"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>

                            {/* Form */}
                            <div className="p-5 space-y-4">
                                {/* Habit Name - REQUIRED */}
                                <div>
                                    <Input
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="Habit name (e.g., Morning Run)"
                                        className="h-12 text-base"
                                        autoFocus
                                    />
                                </div>

                                {/* Frequency */}
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setFrequency("daily")}
                                        className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all ${frequency === "daily"
                                            ? "bg-violet-100 text-violet-700 border-2 border-violet-500"
                                            : "bg-gray-100 text-gray-600 border-2 border-transparent"
                                            }`}
                                    >
                                        Daily
                                    </button>
                                    <button
                                        onClick={() => setFrequency("weekly")}
                                        className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all ${frequency === "weekly"
                                            ? "bg-violet-100 text-violet-700 border-2 border-violet-500"
                                            : "bg-gray-100 text-gray-600 border-2 border-transparent"
                                            }`}
                                    >
                                        Weekly
                                    </button>
                                </div>

                                {/* Weekly Days (only if weekly) */}
                                <AnimatePresence>
                                    {frequency === "weekly" && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: "auto" }}
                                            exit={{ opacity: 0, height: 0 }}
                                            className="space-y-2"
                                        >
                                            <Label className="text-sm text-gray-600">Active Days</Label>
                                            <div className="flex gap-1.5">
                                                {DAYS.map((day, index) => (
                                                    <button
                                                        key={index}
                                                        onClick={() => toggleDay(index)}
                                                        className={`w-10 h-10 rounded-full font-medium transition-all ${weeklyDays.includes(index)
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
                                </AnimatePresence>

                                {/* Start Date */}
                                <div className="flex items-center gap-3">
                                    <Label className="text-sm text-gray-600 whitespace-nowrap">Start</Label>
                                    <Input
                                        type="date"
                                        value={startDate}
                                        onChange={(e) => setStartDate(e.target.value)}
                                        className="flex-1 h-10"
                                    />
                                </div>

                                {/* Optional Fields Toggle */}
                                <button
                                    onClick={() => setShowOptional(!showOptional)}
                                    className="text-sm text-violet-600 hover:text-violet-700 font-medium"
                                >
                                    {showOptional ? "Hide options" : "+ Add description, color"}
                                </button>

                                {/* Optional Fields */}
                                <AnimatePresence>
                                    {showOptional && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: "auto" }}
                                            exit={{ opacity: 0, height: 0 }}
                                            className="space-y-3 pt-2 border-t"
                                        >
                                            <Input
                                                value={description}
                                                onChange={(e) => setDescription(e.target.value)}
                                                placeholder="Description (optional)"
                                                className="h-10"
                                            />
                                            <div className="flex gap-2">
                                                {COLORS.map((c) => (
                                                    <button
                                                        key={c}
                                                        onClick={() => setColor(c)}
                                                        className={`w-8 h-8 rounded-full transition-all ${color === c ? "ring-2 ring-offset-2 ring-gray-400 scale-110" : ""
                                                            }`}
                                                        style={{ backgroundColor: c }}
                                                    />
                                                ))}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            {/* Create Button */}
                            <div className="p-5 pt-0">
                                <button
                                    onClick={handleCreate}
                                    disabled={!name.trim() || isCreating}
                                    className="w-full h-12 bg-violet-600 hover:bg-violet-700 text-white font-semibold rounded-xl flex items-center justify-center gap-2 disabled:opacity-50 transition-all"
                                >
                                    {isCreating ? (
                                        <Loader2 className="h-5 w-5 animate-spin" />
                                    ) : (
                                        <Plus className="h-5 w-5" />
                                    )}
                                    Create Habit
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
