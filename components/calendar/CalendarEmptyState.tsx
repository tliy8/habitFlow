"use client";

import { motion } from "framer-motion";
import { Calendar, Leaf, Clock, ArrowRight } from "lucide-react";
import { format, isToday, isFuture, isPast } from "date-fns";

interface CalendarEmptyStateProps {
    date: Date;
    onFocusToday?: () => void;
}

export default function CalendarEmptyState({
    date,
    onFocusToday,
}: CalendarEmptyStateProps) {
    const isDateToday = isToday(date);
    const isDateFuture = isFuture(date);
    const isDatePast = isPast(date) && !isDateToday;

    // PAST: No logs
    if (isDatePast) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center justify-center py-8 text-center"
            >
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <Leaf className="h-6 w-6 text-gray-400" />
                </div>
                <p className="text-gray-600 font-medium mb-1">
                    No habit logs for this day.
                </p>
                <p className="text-sm text-gray-400">
                    That's okay. Progress isn't about perfection.
                </p>
            </motion.div>
        );
    }

    // TODAY: No completions yet
    if (isDateToday) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center justify-center py-8 text-center"
            >
                <div className="w-12 h-12 bg-violet-100 rounded-full flex items-center justify-center mb-4">
                    <Clock className="h-6 w-6 text-violet-500" />
                </div>
                <p className="text-gray-700 font-medium mb-1">
                    Today is still open.
                </p>
                <p className="text-sm text-gray-500 mb-4">
                    Your habits are waiting for you.
                </p>
                {onFocusToday && (
                    <button
                        onClick={onFocusToday}
                        className="flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white text-sm font-medium rounded-lg transition-colors"
                    >
                        Complete your first habit
                        <ArrowRight className="h-4 w-4" />
                    </button>
                )}
            </motion.div>
        );
    }

    // FUTURE: Not yet
    if (isDateFuture) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center justify-center py-8 text-center"
            >
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <Calendar className="h-6 w-6 text-gray-400" />
                </div>
                <p className="text-gray-600 font-medium mb-1">
                    This day hasn't arrived yet.
                </p>
                <p className="text-sm text-gray-400">
                    Focus on today.
                </p>
            </motion.div>
        );
    }

    return null;
}
