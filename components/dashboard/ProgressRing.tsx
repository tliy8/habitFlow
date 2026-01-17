"use client";

import { motion } from "framer-motion";

interface ProgressRingProps {
    progress: number; // 0-100
    size?: number;
    strokeWidth?: number;
    message?: string;
}

export default function ProgressRing({
    progress,
    size = 180,
    strokeWidth = 12,
    message,
}: ProgressRingProps) {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const offset = circumference - (progress / 100) * circumference;

    // Motivational messages based on progress
    const getMotivation = () => {
        if (message) return message;
        if (progress === 0) return "Let's get started!";
        if (progress < 25) return "Good start!";
        if (progress < 50) return "Keep going!";
        if (progress < 75) return "Great progress!";
        if (progress < 100) return "Almost there!";
        return "Perfect day! 🎉";
    };

    // Color based on progress
    const getColor = () => {
        if (progress < 25) return "#a78bfa"; // violet-400
        if (progress < 50) return "#8b5cf6"; // violet-500
        if (progress < 75) return "#7c3aed"; // violet-600
        return "#10b981"; // emerald-500
    };

    return (
        <div className="flex flex-col items-center gap-3">
            <div className="relative" style={{ width: size, height: size }}>
                {/* Background circle */}
                <svg width={size} height={size} className="transform -rotate-90">
                    <circle
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        stroke="#f3f4f6"
                        strokeWidth={strokeWidth}
                        fill="none"
                    />
                    {/* Progress circle */}
                    <motion.circle
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        stroke={getColor()}
                        strokeWidth={strokeWidth}
                        fill="none"
                        strokeLinecap="round"
                        strokeDasharray={circumference}
                        initial={{ strokeDashoffset: circumference }}
                        animate={{ strokeDashoffset: offset }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                    />
                </svg>

                {/* Center content */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <motion.span
                        key={progress}
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="text-4xl font-bold text-gray-900"
                    >
                        {Math.round(progress)}%
                    </motion.span>
                    <span className="text-sm text-gray-500">complete</span>
                </div>
            </div>

            {/* Motivation message */}
            <motion.p
                key={getMotivation()}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-lg font-medium text-gray-700"
            >
                {getMotivation()}
            </motion.p>
        </div>
    );
}
