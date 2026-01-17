"use client";

import { motion } from "framer-motion";
import { Flame } from "lucide-react";

interface StreakBadgeProps {
    streak: number;
    best?: number;
    size?: "sm" | "md" | "lg";
}

export default function StreakBadge({ streak, best, size = "md" }: StreakBadgeProps) {
    const sizeClasses = {
        sm: "px-2 py-1 text-sm gap-1",
        md: "px-3 py-1.5 text-base gap-1.5",
        lg: "px-4 py-2 text-lg gap-2",
    };

    const iconSizes = {
        sm: "h-4 w-4",
        md: "h-5 w-5",
        lg: "h-6 w-6",
    };

    const isOnFire = streak >= 3;
    const isPersonalBest = best !== undefined && streak >= best && streak > 0;

    return (
        <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className={`
        inline-flex items-center rounded-full font-bold
        ${sizeClasses[size]}
        ${isOnFire
                    ? "bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg shadow-orange-500/30"
                    : "bg-orange-100 text-orange-600"}
      `}
        >
            <motion.div
                animate={isOnFire ? {
                    scale: [1, 1.2, 1],
                    rotate: [0, -5, 5, 0]
                } : {}}
                transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
            >
                <Flame className={iconSizes[size]} />
            </motion.div>

            <span>{streak}</span>

            {streak > 0 && (
                <span className={size === "lg" ? "text-sm opacity-80" : "text-xs opacity-80"}>
                    {streak === 1 ? "day" : "days"}
                </span>
            )}

            {isPersonalBest && (
                <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="ml-1 text-xs bg-white/30 px-1.5 py-0.5 rounded-full"
                >
                    BEST!
                </motion.span>
            )}
        </motion.div>
    );
}
