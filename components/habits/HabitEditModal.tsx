"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Save, Loader2, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import HabitColorPicker from "./HabitColorPicker";
import WeeklyDayPicker from "./WeeklyDayPicker";

interface Habit {
    id: string;
    name: string;
    description?: string;
    frequency: string;
    weeklyDays?: string;
    color: string;
    reminderTime?: string;
}

interface HabitEditModalProps {
    habit: Habit | null;
    isOpen: boolean;
    onClose: () => void;
    onSave: (habit: Partial<Habit>) => Promise<void>;
    onDelete?: (habitId: string) => Promise<void>;
}

const COLORS = [
    "#8b5cf6", // violet
    "#3b82f6", // blue
    "#10b981", // emerald
    "#f59e0b", // amber
    "#ef4444", // red
    "#ec4899", // pink
    "#06b6d4", // cyan
    "#84cc16", // lime
];

export default function HabitEditModal({
    habit,
    isOpen,
    onClose,
    onSave,
    onDelete,
}: HabitEditModalProps) {
    const [name, setName] = useState(habit?.name || "");
    const [description, setDescription] = useState(habit?.description || "");
    const [frequency, setFrequency] = useState(habit?.frequency || "daily");
    const [weeklyDays, setWeeklyDays] = useState<number[]>(
        habit?.weeklyDays ? JSON.parse(habit.weeklyDays) : [1, 2, 3, 4, 5]
    );
    const [color, setColor] = useState(habit?.color || COLORS[0]);
    const [reminderTime, setReminderTime] = useState(habit?.reminderTime || "");
    const [isSaving, setIsSaving] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const isNewHabit = !habit?.id;

    const handleSave = async () => {
        if (!name.trim()) return;
        setIsSaving(true);
        try {
            await onSave({
                id: habit?.id,
                name: name.trim(),
                description: description.trim() || undefined,
                frequency,
                weeklyDays: frequency === "weekly" ? JSON.stringify(weeklyDays) : undefined,
                color,
                reminderTime: reminderTime || undefined,
            });
            onClose();
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!habit?.id || !onDelete) return;
        setIsDeleting(true);
        try {
            await onDelete(habit.id);
            onClose();
        } finally {
            setIsDeleting(false);
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
                        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-lg"
                    >
                        <div className="bg-white rounded-2xl shadow-2xl border overflow-hidden">
                            {/* Header */}
                            <div className="flex items-center justify-between px-6 py-4 border-b bg-gray-50">
                                <h2 className="text-lg font-semibold text-gray-900">
                                    {isNewHabit ? "Create New Habit" : "Edit Habit"}
                                </h2>
                                <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                                    <X className="h-5 w-5" />
                                </button>
                            </div>

                            {/* Form */}
                            <div className="p-6 space-y-5">
                                {/* Name */}
                                <div className="space-y-2">
                                    <Label className="text-gray-700">Habit Name *</Label>
                                    <Input
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="e.g., Morning Exercise"
                                        className="h-11"
                                    />
                                </div>

                                {/* Description */}
                                <div className="space-y-2">
                                    <Label className="text-gray-700">Description (optional)</Label>
                                    <Input
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        placeholder="Brief description..."
                                        className="h-11"
                                    />
                                </div>

                                {/* Frequency */}
                                <div className="space-y-2">
                                    <Label className="text-gray-700">Frequency</Label>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => setFrequency("daily")}
                                            className={`flex-1 py-2.5 px-4 rounded-lg border-2 font-medium transition-all ${frequency === "daily"
                                                    ? "border-violet-500 bg-violet-50 text-violet-700"
                                                    : "border-gray-200 text-gray-600 hover:border-gray-300"
                                                }`}
                                        >
                                            Daily
                                        </button>
                                        <button
                                            onClick={() => setFrequency("weekly")}
                                            className={`flex-1 py-2.5 px-4 rounded-lg border-2 font-medium transition-all ${frequency === "weekly"
                                                    ? "border-violet-500 bg-violet-50 text-violet-700"
                                                    : "border-gray-200 text-gray-600 hover:border-gray-300"
                                                }`}
                                        >
                                            Weekly
                                        </button>
                                    </div>
                                </div>

                                {/* Weekly Days Picker */}
                                {frequency === "weekly" && (
                                    <div className="space-y-2">
                                        <Label className="text-gray-700">Select Days</Label>
                                        <WeeklyDayPicker selected={weeklyDays} onChange={setWeeklyDays} />
                                    </div>
                                )}

                                {/* Color */}
                                <div className="space-y-2">
                                    <Label className="text-gray-700">Color</Label>
                                    <HabitColorPicker colors={COLORS} selected={color} onChange={setColor} />
                                </div>

                                {/* Reminder */}
                                <div className="space-y-2">
                                    <Label className="text-gray-700">Daily Reminder (optional)</Label>
                                    <Input
                                        type="time"
                                        value={reminderTime}
                                        onChange={(e) => setReminderTime(e.target.value)}
                                        className="h-11 w-40"
                                    />
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="flex items-center justify-between px-6 py-4 border-t bg-gray-50">
                                {!isNewHabit && onDelete ? (
                                    <button
                                        onClick={handleDelete}
                                        disabled={isDeleting}
                                        className="flex items-center gap-2 text-red-600 hover:text-red-700 text-sm font-medium"
                                    >
                                        {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                                        Delete Habit
                                    </button>
                                ) : (
                                    <div />
                                )}
                                <div className="flex gap-3">
                                    <Button variant="outline" onClick={onClose}>
                                        Cancel
                                    </Button>
                                    <button
                                        onClick={handleSave}
                                        disabled={!name.trim() || isSaving}
                                        className="flex items-center gap-2 px-5 py-2.5 bg-violet-600 text-white rounded-lg font-medium hover:bg-violet-700 disabled:opacity-50 transition-colors"
                                    >
                                        {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                                        {isNewHabit ? "Create" : "Save"}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
