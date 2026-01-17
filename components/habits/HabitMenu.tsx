"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MoreHorizontal, Edit3, Trash2, Pause, Play, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface HabitMenuProps {
    habitId: string;
    habitName: string;
    isPaused?: boolean;
    onEdit: (habitId: string) => void;
    onDelete: (habitId: string) => void;
    onPause?: (habitId: string) => void;
}

export default function HabitMenu({
    habitId,
    habitName,
    isPaused = false,
    onEdit,
    onDelete,
    onPause,
}: HabitMenuProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    // Close menu on outside click
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };
        if (isOpen) document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [isOpen]);

    const handleDelete = () => {
        setIsOpen(false);
        setShowDeleteConfirm(true);
    };

    const confirmDelete = () => {
        onDelete(habitId);
        setShowDeleteConfirm(false);
    };

    return (
        <>
            <div ref={menuRef} className="relative">
                {/* Trigger button */}
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        setIsOpen(!isOpen);
                    }}
                    className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity"
                    aria-label="Habit options"
                >
                    <MoreHorizontal className="h-4 w-4" />
                </button>

                {/* Dropdown menu */}
                <AnimatePresence>
                    {isOpen && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: -5 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: -5 }}
                            transition={{ duration: 0.1 }}
                            className="absolute right-0 top-full mt-1 w-40 bg-white rounded-lg shadow-lg border py-1 z-50"
                        >
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setIsOpen(false);
                                    onEdit(habitId);
                                }}
                                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                            >
                                <Edit3 className="h-4 w-4" />
                                Edit habit
                            </button>

                            {onPause && (
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setIsOpen(false);
                                        onPause(habitId);
                                    }}
                                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                                >
                                    {isPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
                                    {isPaused ? "Resume habit" : "Pause habit"}
                                </button>
                            )}

                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleDelete();
                                }}
                                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                            >
                                <Trash2 className="h-4 w-4" />
                                Delete habit
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Delete Confirmation Modal */}
            <AnimatePresence>
                {showDeleteConfirm && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
                        onClick={() => setShowDeleteConfirm(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white rounded-2xl shadow-xl max-w-sm w-full mx-4 overflow-hidden"
                        >
                            <div className="p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                    Delete this habit?
                                </h3>
                                <p className="text-gray-600 text-sm">
                                    This will remove <strong>{habitName}</strong> and its future tracking.
                                    Past records will remain for your history.
                                </p>
                            </div>
                            <div className="flex border-t">
                                <button
                                    onClick={() => setShowDeleteConfirm(false)}
                                    className="flex-1 py-3 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={confirmDelete}
                                    className="flex-1 py-3 text-red-600 font-medium hover:bg-red-50 border-l transition-colors"
                                >
                                    Delete habit
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
