import {
    startOfMonth,
    endOfMonth,
    startOfWeek,
    endOfWeek,
    eachDayOfInterval,
    format,
    isSameMonth,
    isSameDay,
    isToday,
    isFuture,
    addMonths,
    subMonths,
    parseISO,
} from "date-fns";

/**
 * Get all days to display in a calendar month view (includes padding days from prev/next month)
 */
export function getCalendarDays(date: Date): Date[] {
    const monthStart = startOfMonth(date);
    const monthEnd = endOfMonth(date);
    const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 }); // Sunday
    const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });

    return eachDayOfInterval({ start: calendarStart, end: calendarEnd });
}

/**
 * Format date for API calls (YYYY-MM-DD)
 */
export function formatDateForAPI(date: Date): string {
    return format(date, "yyyy-MM-dd");
}

/**
 * Format date for display
 */
export function formatDateDisplay(date: Date, formatStr: string = "MMMM yyyy"): string {
    return format(date, formatStr);
}

/**
 * Check if date is in the current month
 */
export function isCurrentMonth(date: Date, currentMonth: Date): boolean {
    return isSameMonth(date, currentMonth);
}

/**
 * Check if two dates are the same day
 */
export function areSameDay(date1: Date, date2: Date): boolean {
    return isSameDay(date1, date2);
}

/**
 * Get next month
 */
export function getNextMonth(date: Date): Date {
    return addMonths(date, 1);
}

/**
 * Get previous month
 */
export function getPrevMonth(date: Date): Date {
    return subMonths(date, 1);
}

/**
 * Get month key for API (YYYY-MM)
 */
export function getMonthKey(date: Date): string {
    return format(date, "yyyy-MM");
}

/**
 * Parse ISO date string to Date
 */
export function parseDate(dateStr: string): Date {
    return parseISO(dateStr);
}

/**
 * Calculate completion percentage
 */
export function calculateCompletionRate(completed: number, total: number): number {
    if (total === 0) return 0;
    return Math.round((completed / total) * 100);
}

/**
 * Get heat map color based on completion rate
 */
export function getHeatMapColor(completionRate: number): string {
    if (completionRate === 0) return "bg-muted/30";
    if (completionRate < 33) return "bg-amber-500/30";
    if (completionRate < 66) return "bg-amber-500/60";
    if (completionRate < 100) return "bg-emerald-500/60";
    return "bg-emerald-500"; // 100%
}

export { isToday, isFuture };
