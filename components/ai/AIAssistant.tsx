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
    onDataChanged?: () => void; // Called when AI creates/logs habits - triggers dashboard refresh
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

export default function AIAssistant({ onHabitsLogged, onDataChanged }: AIAssistantProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [messages, setMessages] = useState<Array<{ role: "user" | "assistant"; content: string; data?: any; mode?: string }>>([]);
    const [error, setError] = useState<string | null>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Focus input when opened
    useEffect(() => {
        if (isOpen && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isOpen]);

    // Auto-scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMessage = input.trim();
        setInput("");
        setIsLoading(true);
        setError(null);

        // Add user message immediately
        const newMessages = [...messages, { role: "user" as const, content: userMessage }];
        setMessages(newMessages);

        try {
            // Include recent history (last 6 messages) for context
            const history = newMessages.slice(-6).map(m => ({
                role: m.role,
                content: m.content
            }));

            const res = await fetch("/api/ai", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    message: userMessage,
                    history: history
                }),
            });

            if (!res.ok) throw new Error("AI request failed");

            const { data } = await res.json();

            // Add AI response
            setMessages(prev => [...prev, {
                role: "assistant",
                content: data.message,
                data: data.data,
                mode: data.mode
            }]);

            // Handle log_habit with completions
            if (data.mode === "log_habit") {
                // Check if completions exist in data (using any cast for safety if needed)
                const completions = (data.data as any)?.completions;
                if (completions && Array.isArray(completions)) {
                    const matched = completions.filter((c: any) => c.matched);
                    if (matched.length > 0) {
                        if (onHabitsLogged) onHabitsLogged(matched);
                    }
                }
                // Trigger dashboard refresh so new habits appear immediately
                if (onDataChanged) onDataChanged();
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
                        className="fixed bottom-6 right-6 z-50 w-96 bg-white rounded-2xl shadow-2xl border overflow-hidden flex flex-col max-h-[600px]"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-violet-500 to-purple-600 text-white shrink-0">
                            <div className="flex items-center gap-2">
                                <Bot className="h-5 w-5" />
                                <span className="font-semibold">Habit Intelligence</span>
                            </div>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-1 hover:bg-white/20 rounded-lg transition-colors"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        {/* Chat Content */}
                        <div className="flex-1 p-4 overflow-y-auto min-h-[300px] max-h-[400px] bg-gray-50/50">
                            {messages.length === 0 ? (
                                <div className="text-center text-gray-500 py-8">
                                    <Bot className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                                    <p className="font-medium text-gray-700 mb-1">How can I help?</p>
                                    <p className="text-sm mb-4">
                                        I can log habits, create new ones, and track your streaks.
                                    </p>
                                    <div className="text-xs text-gray-400 space-y-1">
                                        <p>"I ran 5k and read a book"</p>
                                        <p>"After that I did gym"</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {messages.map((msg, idx) => (
                                        <motion.div
                                            key={idx}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className={cn(
                                                "flex w-full",
                                                msg.role === "user" ? "justify-end" : "justify-start"
                                            )}
                                        >
                                            <div className={cn(
                                                "max-w-[85%] rounded-2xl p-3 text-sm",
                                                msg.role === "user"
                                                    ? "bg-violet-600 text-white rounded-br-none"
                                                    : "bg-white border shadow-sm rounded-bl-none"
                                            )}>
                                                {/* Mode Badge for Assistant */}
                                                {msg.role === "assistant" && msg.mode && (
                                                    <div className={cn(
                                                        "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium mb-2",
                                                        MODE_COLORS[msg.mode as keyof typeof MODE_COLORS]
                                                    )}>
                                                        {msg.mode === "log_habit" && <Calendar className="h-3 w-3" />}
                                                        {msg.mode === "coach" && <MessageSquare className="h-3 w-3" />}
                                                        {msg.mode === "insight" && <TrendingUp className="h-3 w-3" />}
                                                        {msg.mode === "reflection" && <Sparkles className="h-3 w-3" />}
                                                        <span className="capitalize">{msg.mode.replace("_", " ")}</span>
                                                    </div>
                                                )}

                                                <p className="whitespace-pre-line leading-relaxed">{msg.content}</p>

                                                {/* Rich Data Rendering */}
                                                {msg.role === "assistant" && msg.mode === "log_habit" && (msg.data as any)?.completions && (
                                                    <div className="mt-3 space-y-2">
                                                        {(msg.data as any).completions.some((c: any) => c.matched) && (
                                                            <div className="p-2 bg-emerald-50 rounded-lg">
                                                                <p className="text-xs font-medium text-emerald-800 mb-1">✓ Logged:</p>
                                                                <ul className="space-y-1">
                                                                    {(msg.data as any).completions
                                                                        .filter((c: any) => c.matched)
                                                                        .map((c: any, i: number) => (
                                                                            <li key={i} className="text-xs text-emerald-700 flex items-center gap-1.5">
                                                                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                                                                {c.habitName}
                                                                            </li>
                                                                        ))}
                                                                </ul>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </motion.div>
                                    ))}
                                    {isLoading && (
                                        <div className="flex justify-start">
                                            <div className="bg-white border shadow-sm rounded-2xl rounded-bl-none p-4">
                                                <Loader2 className="h-5 w-5 animate-spin text-violet-500" />
                                            </div>
                                        </div>
                                    )}
                                    {error && (
                                        <div className="text-center p-2">
                                            <p className="text-xs text-red-500">{error}</p>
                                        </div>
                                    )}
                                    <div ref={messagesEndRef} />
                                </div>
                            )}
                        </div>

                        {/* Input Area */}
                        <form onSubmit={handleSubmit} className="border-t p-3 bg-white shrink-0">
                            <div className="flex items-end gap-2">
                                <textarea
                                    ref={inputRef}
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    placeholder="Type your message..."
                                    rows={1}
                                    className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent max-h-32"
                                    style={{ minHeight: "40px" }}
                                />
                                <button
                                    type="submit"
                                    disabled={!input.trim() || isLoading}
                                    className="p-2 bg-violet-600 hover:bg-violet-700 disabled:bg-gray-300 text-white rounded-lg transition-colors content-center h-[40px] w-[40px] flex items-center justify-center"
                                >
                                    <Send className="h-4 w-4" />
                                </button>
                            </div>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
