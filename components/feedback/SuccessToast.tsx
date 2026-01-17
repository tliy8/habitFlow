"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Flame, Sparkles, X } from "lucide-react";

interface SuccessToastProps {
    message: string;
    streak?: number;
    isVisible: boolean;
    onClose: () => void;
    duration?: number;
}

export default function SuccessToast({
    message,
    streak,
    isVisible,
    onClose,
    duration = 3000,
}: SuccessToastProps) {
    useEffect(() => {
        if (isVisible) {
            const timer = setTimeout(onClose, duration);
            return () => clearTimeout(timer);
        }
    }, [isVisible, duration, onClose]);

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ y: 100, opacity: 0, scale: 0.9 }}
                    animate={{ y: 0, opacity: 1, scale: 1 }}
                    exit={{ y: 100, opacity: 0, scale: 0.9 }}
                    transition={{ type: "spring", damping: 20 }}
                    className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50"
                >
                    <div className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-3">
                        {/* Success icon */}
                        <motion.div
                            initial={{ scale: 0, rotate: -180 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{ type: "spring", damping: 10, delay: 0.1 }}
                            className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center"
                        >
                            <Check className="h-5 w-5" />
                        </motion.div>

                        {/* Message */}
                        <div>
                            <p className="font-semibold">{message}</p>
                            {streak !== undefined && streak > 0 && (
                                <motion.div
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.2 }}
                                    className="flex items-center gap-1 text-sm text-white/90"
                                >
                                    <Flame className="h-4 w-4 text-orange-300" />
                                    <span>{streak}-day streak!</span>
                                    {streak >= 7 && <Sparkles className="h-4 w-4 text-yellow-300" />}
                                </motion.div>
                            )}
                        </div>

                        {/* Close button */}
                        <button
                            onClick={onClose}
                            className="ml-2 p-1 hover:bg-white/20 rounded-full transition-colors"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
