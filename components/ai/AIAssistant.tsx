"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, Send, Loader2, X, Sparkles, MessageSquare, TrendingUp, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

interface AIResponse {
    mode: "log_habit" | "coach" | "insight" | "reflection";
    message: string;
    data: any;
}

interface AIAssistantProps {
    onHabitsLogged?: (completions: Array<{ habitId: string; habitName: string }>) => void;
}

const MODE_ICONS = {
    log_habit: Calendar,
    coach: MessageSquare,
    insight: TrendingUp,
    reflection: Sparkles,
};

const MODE_COLORS = {
    log_habit: "text-blue-600 bg-blue-50",
    coach: "text-violet-600 bg-violet-50",
    insight: "text-emerald-600 bg-emerald-50",
    reflection: "text-amber-600 bg-amber-50",
};

export default function AIAssistant({ onHabitsLogged }: AIAssistantProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [response, setResponse] = useState<AIResponse | null>(null);
    const [error, setError] = useState<string | null>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);

    // Focus input when opened
    useEffect(() => {
        if (isOpen && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        setIsLoading(true);
        setError(null);

        try {
            const res = await fetch("/api/ai", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message: input.trim() }),
            });

            if (!res.ok) throw new Error("AI request failed");

            const { data } = await res.json();
            setResponse(data);
            setInput("");

            // Handle log_habit with completions
            if (data.mode === "log_habit" && data.data?.completions && onHabitsLogged) {
                const matched = data.data.completions.filter((c: any) => c.matched);
                if (matched.length > 0) {
                    onHabitsLogged(matched);
                }
            }
        } catch (err) {
            console.error("[AIAssistant] Error:", err);
            setError("Something went wrong. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e);
        }
    };

    const Icon = response ? MODE_ICONS[response.mode] : Bot;

    return (
        <>
            {/* Floating Button */}
            <motion.button
                onClick={() => setIsOpen(true)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={cn(
                    "fixed bottom-6 right-6 z-50 p-4 rounded-full shadow-lg transition-colors",
                    "bg-gradient-to-br from-violet-500 to-purple-600 text-white",
                    "hover:from-violet-600 hover:to-purple-700",
                    isOpen && "hidden"
                )}
                aria-label="Open AI Assistant"
            >
                <Bot className="h-6 w-6" />
            </motion.button>

            {/* Assistant Panel */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        className="fixed bottom-6 right-6 z-50 w-96 bg-white rounded-2xl shadow-2xl border overflow-hidden"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-violet-500 to-purple-600 text-white">
                            <div className="flex items-center gap-2">
                                <Bot className="h-5 w-5" />
                                <span className="font-semibold">Habit Coach</span>
                            </div>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-1 hover:bg-white/20 rounded-lg transition-colors"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="p-4 min-h-[200px] max-h-[400px] overflow-y-auto">
                            {/* Response */}
                            {response ? (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="space-y-3"
                                >
                                    {/* Mode badge */}
                                    <div className={cn(
                                        "inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium",
                                        MODE_COLORS[response.mode]
                                    )}>
                                        <Icon className="h-3 w-3" />
                                        {response.mode === "log_habit" && "Logging"}
                                        {response.mode === "coach" && "Coaching"}
                                        {response.mode === "insight" && "Insight"}
                                        {response.mode === "reflection" && "Reflection"}
                                    </div>

                                    {/* Message - preserve line breaks */}
                                    <p className="text-gray-700 leading-relaxed whitespace-pre-line">{response.message}</p>

                                    {/* Completions data (for log_habit) */}
                                    {response.mode === "log_habit" && response.data?.completions && (
                                        <div className="mt-3 space-y-2">
                                            {/* Matched habits */}
                                            {response.data.completions.filter((c: any) => c.matched).length > 0 && (
                                                <div className="p-3 bg-emerald-50 rounded-lg">
                                                    <p className="text-sm font-medium text-emerald-800 mb-2">✓ Logged today:</p>
                                                    <ul className="space-y-1">
                                                        {response.data.completions
                                                            .filter((c: any) => c.matched)
                                                            .map((c: any, i: number) => (
                                                                <li key={i} className="text-sm text-emerald-700 flex items-center gap-2">
                                                                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                                                                    {c.habitName}
                                                                </li>
                                                            ))}
                                                    </ul>
                                                </div>
                                            )}

                                            {/* Unmatched activities - suggest creation */}
                                            {response.data.unmatchedActivities && response.data.unmatchedActivities.length > 0 && (
                                                <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
                                                    <p className="text-sm font-medium text-amber-800 mb-2">New activities detected:</p>
                                                    <ul className="space-y-1 mb-3">
                                                        {response.data.unmatchedActivities.map((activity: string, i: number) => (
                                                            <li key={i} className="text-sm text-amber-700 flex items-center gap-2">
                                                                <span className="w-2 h-2 rounded-full bg-amber-400" />
                                                                {activity}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                    <p className="text-xs text-amber-600">
                                                        Add these as habits from your dashboard to track them.
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Clear button */}
                                    <button
                                        onClick={() => setResponse(null)}
                                        className="text-sm text-violet-600 hover:text-violet-700"
                                    >
                                        Ask another question
                                    </button>
                                </motion.div>
                            ) : error ? (
                                <div className="text-center py-4">
                                    <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-red-50 flex items-center justify-center">
                                        <X className="h-6 w-6 text-red-400" />
                                    </div>
                                    <p className="text-red-600 font-medium mb-1">{error}</p>
                                    <p className="text-sm text-gray-500 mb-3">
                                        {error.includes("busy") ? "The AI is processing too many requests." : "Something went wrong."}
                                    </p>
                                    <button
                                        onClick={() => setError(null)}
                                        className="text-sm text-violet-600 hover:text-violet-700 underline"
                                    >
                                        Try again
                                    </button>
                                </div>
                            ) : (
                                <div className="text-center text-gray-500 py-8">
                                    <Bot className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                                    <p className="font-medium text-gray-700 mb-1">How can I help?</p>
                                    <p className="text-sm mb-4">
                                        Log habits, get coaching, or ask for insights.
                                    </p>
                                    <div className="text-xs text-gray-400 space-y-1">
                                        <p>"I did my morning run"</p>
                                        <p>"I'm struggling with motivation"</p>
                                        <p>"How am I doing this week?"</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Input */}
                        <form onSubmit={handleSubmit} className="border-t p-3">
                            <div className="flex items-end gap-2">
                                <textarea
                                    ref={inputRef}
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    placeholder="e.g., I did my morning run today"
                                    rows={2}
                                    className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                                />
                                <button
                                    type="submit"
                                    disabled={!input.trim() || isLoading}
                                    className="p-2 bg-violet-600 hover:bg-violet-700 disabled:bg-gray-300 text-white rounded-lg transition-colors"
                                >
                                    {isLoading ? (
                                        <Loader2 className="h-5 w-5 animate-spin" />
                                    ) : (
                                        <Send className="h-5 w-5" />
                                    )}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
