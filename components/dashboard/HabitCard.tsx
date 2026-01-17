"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Check, Loader2, ChevronDown, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";

interface HabitCardProps {
    id: string;
    name: string;
    color: string;
    isCompleted: boolean;
    isLoading?: boolean;
    note?: string;
    onToggle: (id: string) => void;
    onNoteChange?: (id: string, note: string) => void;
}

export default function HabitCard({
    id,
    name,
    color,
    isCompleted,
    isLoading = false,
    note,
    onToggle,
    onNoteChange,
}: HabitCardProps) {
    const [showNote, setShowNote] = useState(false);
    const [noteText, setNoteText] = useState(note || "");

    const handleClick = () => {
        if (!isLoading) {
            onToggle(id);
        }
    };

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
                "rounded-xl border-2 transition-all",
                isCompleted
                    ? "bg-emerald-50 border-emerald-200"
                    : "bg-white border-gray-100 hover:border-violet-200"
            )}
        >
            {/* Main habit row */}
            <button
                onClick={handleClick}
                disabled={isLoading}
                className="w-full flex items-center gap-4 p-4 text-left focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-inset rounded-xl"
                aria-pressed={isCompleted}
                aria-label={`${name}: ${isCompleted ? "completed" : "not completed"}`}
            >
                {/* Checkbox */}
                <motion.div
                    whileTap={{ scale: 0.9 }}
                    className={cn(
                        "w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all flex-shrink-0",
                        isCompleted ? "border-transparent" : "border-gray-300"
                    )}
                    style={{
                        backgroundColor: isCompleted ? color : "transparent",
                    }}
                >
                    {isLoading ? (
                        <Loader2 className={cn("h-4 w-4 animate-spin", isCompleted ? "text-white" : "text-gray-400")} />
                    ) : isCompleted ? (
                        <motion.div
                            initial={{ scale: 0, rotate: -45 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{ type: "spring", damping: 15, stiffness: 400 }}
                        >
                            <Check className="h-5 w-5 text-white" strokeWidth={3} />
                        </motion.div>
                    ) : (
                        <div
                            className="w-3 h-3 rounded-full opacity-30"
                            style={{ backgroundColor: color }}
                        />
                    )}
                </motion.div>

                {/* Habit name */}
                <span className={cn(
                    "flex-1 font-medium text-base",
                    isCompleted && "text-gray-500 line-through"
                )}>
                    {name}
                </span>

                {/* Note toggle */}
                {onNoteChange && (
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            setShowNote(!showNote);
                        }}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                        aria-label="Toggle note"
                    >
                        <MessageSquare className="h-4 w-4" />
                    </button>
                )}
            </button>

            {/* Note section (collapsed by default) */}
            {showNote && onNoteChange && (
                <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="px-4 pb-4"
                >
                    <textarea
                        value={noteText}
                        onChange={(e) => setNoteText(e.target.value)}
                        onBlur={() => onNoteChange(id, noteText)}
                        placeholder="Add a note..."
                        className="w-full p-3 text-sm border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-violet-500"
                        rows={2}
                    />
                </motion.div>
            )}
        </motion.div>
    );
}
