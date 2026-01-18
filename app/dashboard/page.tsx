"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import useSWR from "swr";
import { LogOut, Zap, Plus, Check, Loader2, ChevronLeft, ChevronRight, X, Flame, Shield } from "lucide-react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, startOfWeek, endOfWeek, isSameMonth, isToday, isFuture, isPast, addMonths, subMonths } from "date-fns";

import QuickAddFlow from "@/components/habits/QuickAddFlow";
import HabitMenu from "@/components/habits/HabitMenu";
import EditHabitModal from "@/components/habits/EditHabitModal";
import CalendarEmptyState from "@/components/calendar/CalendarEmptyState";
import AIAssistant from "@/components/ai/AIAssistant";
import { getMonthKey } from "@/lib/date-utils";
import { cn } from "@/lib/utils";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function getIntensityColor(intensity: number, isDateToday: boolean): string {
    if (intensity === 0) return isDateToday ? "bg-violet-50" : "bg-gray-50";
    if (intensity < 25) return "bg-violet-100";
    if (intensity < 50) return "bg-violet-200";
    if (intensity < 75) return "bg-violet-300";
    if (intensity < 100) return "bg-violet-400";
    return "bg-emerald-400";
}

interface Habit {
    id: string;
    name: string;
    color: string;
    archived: boolean;
    frequency?: string;
}

interface Completion {
    date: string;
    habitId: string;
}

export default function DashboardPage() {
    const { data: session, status } = useSession();
    const router = useRouter();

    // State - ALL useState hooks first, unconditionally
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [loadingHabits, setLoadingHabits] = useState<Record<string, boolean>>({});
    const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
    const [optimisticToggles, setOptimisticToggles] = useState<Record<string, boolean>>({});

    // Data fetching - SWR hooks, always called
    const monthKey = getMonthKey(currentMonth);
    const { data: calendarData, mutate: mutateCalendar } = useSWR<any>(
        `/api/calendar?month=${monthKey}`,
        fetcher,
        { revalidateOnFocus: false }
    );

    const { data: statsData, mutate: mutateStats } = useSWR<any>(
        "/api/stats",
        fetcher,
        { revalidateOnFocus: false }
    );

    // Extract data (safe defaults for when loading)
    const habits: Habit[] = calendarData?.data?.habits?.filter((h: Habit) => !h.archived) || [];
    const completions: Completion[] = calendarData?.data?.completions || [];
    const stats = statsData?.data?.overview;

    // ALL useMemo hooks - called unconditionally
    const completionMap = useMemo(() => {
        const map = new Map<string, Set<string>>();
        completions.forEach((c) => {
            const dayKey = c.date.split("T")[0];
            if (!map.has(dayKey)) map.set(dayKey, new Set());
            map.get(dayKey)!.add(c.habitId);
        });
        return map;
    }, [completions]);

    const todayKey = useMemo(() => format(new Date(), "yyyy-MM-dd"), []);

    const serverTodayCompletedIds = useMemo(() => {
        return completionMap.get(todayKey) || new Set<string>();
    }, [completionMap, todayKey]);

    const calendarDays = useMemo(() => {
        const monthStart = startOfMonth(currentMonth);
        const monthEnd = endOfMonth(currentMonth);
        const calendarStart = startOfWeek(monthStart);
        const calendarEnd = endOfWeek(monthEnd);
        return eachDayOfInterval({ start: calendarStart, end: calendarEnd });
    }, [currentMonth]);

    // ALL useCallback hooks - called unconditionally
    const isHabitCompletedToday = useCallback((habitId: string): boolean => {
        if (habitId in optimisticToggles) {
            return optimisticToggles[habitId];
        }
        return serverTodayCompletedIds.has(habitId);
    }, [optimisticToggles, serverTodayCompletedIds]);

    const todayCompletedCount = useMemo(() => {
        let count = 0;
        habits.forEach(h => {
            if (isHabitCompletedToday(h.id)) count++;
        });
        return count;
    }, [habits, isHabitCompletedToday]);

    const todayProgress = habits.length > 0 ? Math.round((todayCompletedCount / habits.length) * 100) : 0;

    const handleToggle = useCallback((habitId: string) => {
        const currentState = isHabitCompletedToday(habitId);
        const newState = !currentState;

        // 1. INSTANT: Update optimistic state (triggers immediate re-render)
        setOptimisticToggles(prev => ({ ...prev, [habitId]: newState }));

        // 2. BACKGROUND: Fire API request (no await, no blocking)
        fetch(`/api/habits/${habitId}/complete`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ isBackfill: false }),
        })
            .then(res => {
                if (!res.ok) throw new Error("Failed");
                // SUCCESS: Keep optimistic state active.
                // Do NOT clear it here - that causes the revert.
                // Do NOT call mutateCalendar() immediately - stale data race.
                // The optimistic state will be naturally replaced when SWR's
                // background revalidation brings fresh server data.
            })
            .catch(() => {
                // REVERT: Restore previous state on failure only
                setOptimisticToggles(prev => ({ ...prev, [habitId]: currentState }));
                console.error("Toggle failed, reverted");
            });
    }, [isHabitCompletedToday]);

    const handleCreate = useCallback(async (data: any) => {
        try {
            const res = await fetch("/api/habits", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            if (!res.ok) {
                const err = await res.text();
                throw new Error("Failed to create habit: " + err);
            }

            await Promise.all([mutateCalendar(), mutateStats()]);
        } catch (error) {
            console.error(error);
            alert("Failed to create habit.");
        }
    }, [mutateCalendar, mutateStats]);

    const handleEdit = useCallback((habitId: string) => {
        const habit = habits.find((h) => h.id === habitId);
        if (habit) setEditingHabit(habit);
    }, [habits]);

    const handleSaveEdit = useCallback(async (data: { name: string; color: string; frequency: string }) => {
        if (!editingHabit) return;
        const res = await fetch(`/api/habits/${editingHabit.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });
        if (!res.ok) {
            throw new Error("Failed to update habit");
        }
        setEditingHabit(null);
        mutateCalendar();
        mutateStats();
    }, [editingHabit, mutateCalendar, mutateStats]);

    const handleDelete = useCallback(async (habitId: string) => {
        await fetch(`/api/habits/${habitId}`, { method: "DELETE" });
        mutateCalendar();
        mutateStats();
    }, [mutateCalendar, mutateStats]);

    const getCompletionRate = useCallback((dateKey: string) => {
        const completed = completionMap.get(dateKey)?.size || 0;
        return habits.length > 0 ? (completed / habits.length) * 100 : 0;
    }, [completionMap, habits.length]);

    const selectedDateKey = selectedDate ? format(selectedDate, "yyyy-MM-dd") : null;
    const selectedCompletedIds = selectedDateKey ? completionMap.get(selectedDateKey) || new Set() : new Set();
    const selectedIsEmpty = selectedDate && selectedCompletedIds.size === 0;

    const focusToday = useCallback(() => {
        setSelectedDate(null);
        document.getElementById("today-panel")?.scrollIntoView({ behavior: "smooth" });
    }, []);

    // useEffect - called unconditionally
    useEffect(() => {
        if (status === "unauthenticated") router.push("/login");
    }, [status, router]);

    // ===== EARLY RETURNS AFTER ALL HOOKS =====
    if (status === "loading") {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-violet-50 via-white to-purple-50">
                <Loader2 className="h-8 w-8 animate-spin text-violet-600" />
            </div>
        );
    }

    if (!session) return null;

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-violet-50/30">
            {/* Header */}
            <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-14">
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-gradient-to-br from-violet-500 to-purple-600 rounded-lg">
                            <Zap className="h-4 w-4 text-white" />
                        </div>
                        <span className="font-bold text-gray-900">HabitFlow</span>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 px-3 py-1 bg-orange-50 rounded-full">
                            <Flame className="h-4 w-4 text-orange-500" />
                            <span className="text-sm font-semibold text-orange-700">
                                {stats?.currentStreak || 0} days
                            </span>
                        </div>
                        <button onClick={() => signOut()} className="p-2 text-gray-400 hover:text-gray-600 rounded-lg">
                            <LogOut className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 py-6">
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

                    {/* LEFT: CALENDAR (60%) */}
                    <div className="lg:col-span-3">
                        <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
                            {/* Calendar Header */}
                            <div className="flex items-center justify-between px-6 py-4 border-b bg-gray-50/50">
                                <button
                                    onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                                    className="p-2 hover:bg-gray-100 rounded-lg"
                                >
                                    <ChevronLeft className="h-5 w-5 text-gray-600" />
                                </button>
                                <h2 className="text-lg font-semibold text-gray-900">
                                    {format(currentMonth, "MMMM yyyy")}
                                </h2>
                                <button
                                    onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                                    className="p-2 hover:bg-gray-100 rounded-lg"
                                >
                                    <ChevronRight className="h-5 w-5 text-gray-600" />
                                </button>
                            </div>

                            {/* Weekday Headers */}
                            <div className="grid grid-cols-7 border-b">
                                {WEEKDAYS.map((day) => (
                                    <div key={day} className="py-2 text-center text-xs font-medium text-gray-500">
                                        {day}
                                    </div>
                                ))}
                            </div>

                            {/* Calendar Grid */}
                            <div className="grid grid-cols-7">
                                {calendarDays.map((date) => {
                                    const dateKey = format(date, "yyyy-MM-dd");
                                    const intensity = getCompletionRate(dateKey);
                                    const isCurrentMonth = isSameMonth(date, currentMonth);
                                    const isDateToday = isToday(date);
                                    const isDateFuture = isFuture(date);
                                    const isSelected = selectedDate && format(selectedDate, "yyyy-MM-dd") === dateKey;

                                    return (
                                        <motion.button
                                            key={dateKey}
                                            onClick={() => !isDateFuture && setSelectedDate(date)}
                                            disabled={isDateFuture}
                                            whileHover={!isDateFuture ? { scale: 1.05 } : {}}
                                            whileTap={!isDateFuture ? { scale: 0.95 } : {}}
                                            className={cn(
                                                "relative aspect-square p-1 border-r border-b transition-all",
                                                isCurrentMonth ? "text-gray-900" : "text-gray-400",
                                                isDateFuture && "opacity-40 cursor-not-allowed",
                                                isSelected && "ring-2 ring-violet-500 ring-inset z-10"
                                            )}
                                            title={isDateFuture ? "You'll get there" : undefined}
                                        >
                                            <div className={cn(
                                                "absolute inset-1 rounded-lg transition-colors",
                                                getIntensityColor(intensity, isDateToday),
                                                isDateToday && "ring-2 ring-violet-500 ring-offset-2 shadow-lg shadow-violet-200"
                                            )} />

                                            <div className={cn(
                                                "relative z-10 h-full flex flex-col items-center justify-center",
                                                intensity === 100 && !isDateToday && "text-emerald-800"
                                            )}>
                                                <span className={cn(
                                                    "text-sm font-medium",
                                                    isDateToday && "text-violet-700 font-bold"
                                                )}>
                                                    {format(date, "d")}
                                                </span>
                                                {isDateToday && (
                                                    <span className="text-[10px] font-medium text-violet-600 mt-0.5">
                                                        Today
                                                    </span>
                                                )}
                                            </div>
                                        </motion.button>
                                    );
                                })}
                            </div>

                            {/* Legend */}
                            <div className="flex items-center justify-center gap-4 py-3 border-t text-xs text-gray-500">
                                <div className="flex items-center gap-1">
                                    <div className="w-3 h-3 rounded bg-gray-100" />
                                    <span>None</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <div className="w-3 h-3 rounded bg-violet-300" />
                                    <span>Partial</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <div className="w-3 h-3 rounded bg-emerald-400" />
                                    <span>Complete</span>
                                </div>
                            </div>
                        </div>

                        {/* Selected Date Panel */}
                        <AnimatePresence>
                            {selectedDate && !isToday(selectedDate) && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="mt-4 bg-white rounded-xl border shadow-sm overflow-hidden"
                                >
                                    <div className="flex items-center justify-between px-4 py-3 border-b bg-gray-50/50">
                                        <div>
                                            <h3 className="font-semibold text-gray-900">
                                                {format(selectedDate, "EEE, MMM d")}
                                            </h3>
                                            <p className="text-xs text-gray-500">
                                                {selectedCompletedIds.size > 0
                                                    ? `${selectedCompletedIds.size} habit${selectedCompletedIds.size > 1 ? "s" : ""} logged`
                                                    : "No habit logs"
                                                }
                                            </p>
                                        </div>
                                        <button onClick={() => setSelectedDate(null)} className="p-1 hover:bg-gray-100 rounded">
                                            <X className="h-4 w-4 text-gray-500" />
                                        </button>
                                    </div>

                                    <div className="p-4">
                                        {selectedIsEmpty ? (
                                            <CalendarEmptyState date={selectedDate} onFocusToday={focusToday} />
                                        ) : (
                                            <>
                                                <div className="space-y-2">
                                                    {habits.map((habit) => {
                                                        const isCompleted = selectedCompletedIds.has(habit.id);
                                                        return (
                                                            <div key={habit.id} className="flex items-center gap-3 py-2">
                                                                <div
                                                                    className={cn(
                                                                        "w-5 h-5 rounded-full border-2 flex items-center justify-center",
                                                                        isCompleted ? "border-transparent" : "border-gray-300"
                                                                    )}
                                                                    style={{ backgroundColor: isCompleted ? habit.color : "transparent" }}
                                                                >
                                                                    {isCompleted && <Check className="h-3 w-3 text-white" />}
                                                                </div>
                                                                <span className={cn(isCompleted && "text-gray-400 line-through")}>
                                                                    {habit.name}
                                                                </span>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                                <p className="text-sm text-gray-500 mt-4 italic">
                                                    "Progress is built over time. One day doesn't define you."
                                                </p>
                                            </>
                                        )}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* RIGHT: TODAY ACTION PANEL (40%) */}
                    <div id="today-panel" className="lg:col-span-2 space-y-4">
                        {/* Today Card */}
                        <div className="bg-white rounded-2xl border shadow-sm p-5">
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900">Today</h2>
                                    <p className="text-sm text-gray-500">{format(new Date(), "EEEE, MMMM d")}</p>
                                </div>
                                <div className="text-right">
                                    <span className="text-3xl font-bold text-violet-600">{todayProgress}%</span>
                                </div>
                            </div>

                            <div className="h-3 bg-gray-100 rounded-full overflow-hidden mb-2">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${todayProgress}%` }}
                                    transition={{ duration: 0.5 }}
                                    className={cn(
                                        "h-full rounded-full",
                                        todayProgress === 100 ? "bg-emerald-500" : "bg-violet-500"
                                    )}
                                />
                            </div>
                            <p className="text-sm text-gray-500">
                                {todayCompletedCount}/{habits.length} habits completed
                            </p>
                        </div>

                        {/* Today's Habits */}
                        <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
                            <div className="flex items-center justify-between px-5 py-4 border-b">
                                <h3 className="font-semibold text-gray-900">Habits</h3>
                                <button
                                    onClick={() => setIsAddOpen(true)}
                                    className="p-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg"
                                >
                                    <Plus className="h-4 w-4" />
                                </button>
                            </div>

                            <div className="divide-y">
                                {habits.length === 0 ? (
                                    <div className="p-6 text-center">
                                        <p className="text-gray-500 mb-3">No habits yet</p>
                                        <button onClick={() => setIsAddOpen(true)} className="text-violet-600 font-medium">
                                            + Create your first habit
                                        </button>
                                    </div>
                                ) : (
                                    habits.map((habit) => {
                                        const isCompleted = isHabitCompletedToday(habit.id);
                                        const isLoading = loadingHabits[habit.id];

                                        return (
                                            <div
                                                key={habit.id}
                                                className={cn(
                                                    "group flex items-center gap-4 px-5 py-4 transition-colors",
                                                    isCompleted ? "bg-emerald-50/50" : "hover:bg-gray-50"
                                                )}
                                            >
                                                {/* Checkbox */}
                                                <button
                                                    onClick={() => handleToggle(habit.id)}
                                                    disabled={isLoading}
                                                    className="flex-shrink-0"
                                                >
                                                    <div
                                                        className={cn(
                                                            "w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all",
                                                            isCompleted ? "border-transparent" : "border-gray-300"
                                                        )}
                                                        style={{ backgroundColor: isCompleted ? habit.color : "transparent" }}
                                                    >
                                                        {isLoading ? (
                                                            <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                                                        ) : isCompleted ? (
                                                            <motion.div
                                                                initial={{ scale: 0 }}
                                                                animate={{ scale: 1 }}
                                                                transition={{ type: "spring", damping: 15 }}
                                                            >
                                                                <Check className="h-4 w-4 text-white" />
                                                            </motion.div>
                                                        ) : null}
                                                    </div>
                                                </button>

                                                {/* Name */}
                                                <span className={cn(
                                                    "flex-1 font-medium",
                                                    isCompleted && "text-gray-400 line-through"
                                                )}>
                                                    {habit.name}
                                                </span>

                                                {/* Menu */}
                                                <HabitMenu
                                                    habitId={habit.id}
                                                    habitName={habit.name}
                                                    onEdit={handleEdit}
                                                    onDelete={handleDelete}
                                                />
                                            </div>
                                        );
                                    })
                                )}
                            </div>

                            {/* Affirmation */}
                            {todayProgress > 0 && todayProgress < 100 && (
                                <div className="px-5 py-3 bg-violet-50 border-t">
                                    <p className="text-sm text-violet-700 font-medium">
                                        Nice. Momentum counts. 💪
                                    </p>
                                </div>
                            )}
                            {todayProgress === 100 && (
                                <div className="px-5 py-3 bg-emerald-50 border-t">
                                    <p className="text-sm text-emerald-700 font-medium">
                                        Perfect day! You're building something great. 🎉
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Grace Days */}
                        <div className="bg-white rounded-xl border shadow-sm p-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Shield className="h-4 w-4 text-violet-500" />
                                    <span className="text-sm text-gray-600">Grace days</span>
                                </div>
                                <div className="flex gap-1">
                                    <div className="w-3 h-3 rounded-full bg-violet-500" title="Available" />
                                    <div className="w-3 h-3 rounded-full bg-violet-500" title="Available" />
                                </div>
                            </div>
                            <p className="text-xs text-gray-400 mt-2">
                                2 grace days protect your streak this week
                            </p>
                        </div>
                    </div>
                </div>
            </main>

            {/* Modals */}
            <QuickAddFlow isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} onCreate={handleCreate} />
            <EditHabitModal
                isOpen={!!editingHabit}
                onClose={() => setEditingHabit(null)}
                onSave={handleSaveEdit}
                habit={editingHabit}
            />

            {/* AI Assistant */}
            <AIAssistant
                onHabitsLogged={(completions) => {
                    // Auto-toggle habits based on AI logging
                    completions.forEach((c) => handleToggle(c.habitId));
                }}
                onDataChanged={() => {
                    // Refresh habits list when AI creates/logs habits
                    mutateCalendar();
                    mutateStats();
                }}
            />
        </div>
    );
}
