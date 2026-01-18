"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

const COLORS = [
    "#8b5cf6", "#3b82f6", "#10b981", "#f59e0b", "#ef4444",
    "#ec4899", "#06b6d4", "#84cc16", "#f97316", "#6366f1",
];

interface EditHabitModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: { name: string; color: string; frequency: string }) => void;
    habit: {
        id: string;
        name: string;
        color: string;
        frequency?: string;
    } | null;
}

export default function EditHabitModal({
    isOpen,
    onClose,
    onSave,
    habit,
}: EditHabitModalProps) {
    const [name, setName] = useState("");
    const [color, setColor] = useState(COLORS[0]);
    const [frequency, setFrequency] = useState("daily");
    const [isSaving, setIsSaving] = useState(false);

    // Populate form when habit changes
    useEffect(() => {
        if (habit) {
            setName(habit.name);
            setColor(habit.color || COLORS[0]);
            setFrequency(habit.frequency || "daily");
        }
    }, [habit]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim() || isSaving) return;

        setIsSaving(true);
        try {
            await onSave({ name: name.trim(), color, frequency });
            onClose(); // Only close on success
        } catch (error) {
            console.error("Save failed:", error);
            // Don't close - let user retry
        } finally {
            setIsSaving(false);
        }
    };

    if (!isOpen || !habit) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
                onClick={onClose}
            >
                <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.95, opacity: 0 }}
                    onClick={(e) => e.stopPropagation()}
                    className="bg-white rounded-2xl shadow-xl max-w-md w-full mx-4 overflow-hidden"
                >
                    {/* Header */}
                    <div className="flex items-center justify-between px-6 py-4 border-b">
                        <h2 className="text-lg font-semibold text-gray-900">Edit Habit</h2>
                        <button
                            onClick={onClose}
                            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="p-6 space-y-5">
                        {/* Name */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Habit name
                            </label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                                placeholder="e.g., Morning Run"
                                autoFocus
                            />
                        </div>

                        {/* Frequency */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Frequency
                            </label>
                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    onClick={() => setFrequency("daily")}
                                    className={`flex-1 py-2 px-4 rounded-lg border-2 transition-colors ${frequency === "daily"
                                        ? "border-violet-500 bg-violet-50 text-violet-700"
                                        : "border-gray-200 hover:border-gray-300"
                                        }`}
                                >
                                    Daily
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setFrequency("weekly")}
                                    className={`flex-1 py-2 px-4 rounded-lg border-2 transition-colors ${frequency === "weekly"
                                        ? "border-violet-500 bg-violet-50 text-violet-700"
                                        : "border-gray-200 hover:border-gray-300"
                                        }`}
                                >
                                    Weekly
                                </button>
                            </div>
                        </div>

                        {/* Color */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Color
                            </label>
                            <div className="flex flex-wrap gap-2">
                                {COLORS.map((c) => (
                                    <button
                                        key={c}
                                        type="button"
                                        onClick={() => setColor(c)}
                                        className={`w-8 h-8 rounded-full transition-transform ${color === c ? "ring-2 ring-offset-2 ring-violet-500 scale-110" : ""
                                            }`}
                                        style={{ backgroundColor: c }}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Note */}
                        <p className="text-xs text-gray-500">
                            Changes apply from today onward. Past records are preserved.
                        </p>

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={!name.trim() || isSaving}
                            className="w-full py-3 bg-violet-600 hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-xl transition-colors"
                        >
                            {isSaving ? "Saving..." : "Save Changes"}
                        </button>
                    </form>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
