import { format } from "date-fns";

interface Habit {
    id: string;
    name: string;
    description?: string;
    frequency: string;
    color: string;
    createdAt: Date;
}

interface Completion {
    date: Date;
    habitId: string;
}

interface ExportData {
    habits: Habit[];
    completions: Completion[];
    stats: {
        totalCompletions: number;
        currentStreak: number;
        longestStreak: number;
        monthlyRate: number;
    };
}

/**
 * Export habits and completions to CSV format
 */
export function exportToCSV(data: ExportData): string {
    const lines: string[] = [];

    // Header
    lines.push("Habit Tracker Export");
    lines.push(`Generated: ${format(new Date(), "yyyy-MM-dd HH:mm:ss")}`);
    lines.push("");

    // Summary
    lines.push("=== SUMMARY ===");
    lines.push(`Total Habits,${data.habits.length}`);
    lines.push(`Total Completions,${data.stats.totalCompletions}`);
    lines.push(`Current Streak,${data.stats.currentStreak} days`);
    lines.push(`Longest Streak,${data.stats.longestStreak} days`);
    lines.push(`Monthly Completion Rate,${data.stats.monthlyRate}%`);
    lines.push("");

    // Habits
    lines.push("=== HABITS ===");
    lines.push("ID,Name,Description,Frequency,Color,Created");
    data.habits.forEach((habit) => {
        lines.push(
            `${habit.id},"${habit.name}","${habit.description || ""}",${habit.frequency},${habit.color},${format(habit.createdAt, "yyyy-MM-dd")}`
        );
    });
    lines.push("");

    // Completions
    lines.push("=== COMPLETIONS ===");
    lines.push("Date,Habit ID");
    data.completions.forEach((completion) => {
        lines.push(`${format(completion.date, "yyyy-MM-dd")},${completion.habitId}`);
    });

    return lines.join("\n");
}

/**
 * Download CSV file
 */
export function downloadCSV(csvContent: string, filename: string = "habit-tracker-export.csv") {
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

/**
 * Generate a simple text report
 */
export function generateReport(data: ExportData): string {
    const lines: string[] = [];

    lines.push("╔════════════════════════════════════════╗");
    lines.push("║       HABIT TRACKER REPORT             ║");
    lines.push("╚════════════════════════════════════════╝");
    lines.push("");
    lines.push(`Generated: ${format(new Date(), "MMMM d, yyyy 'at' h:mm a")}`);
    lines.push("");
    lines.push("──────────────────────────────────────────");
    lines.push("OVERVIEW");
    lines.push("──────────────────────────────────────────");
    lines.push(`Total Habits: ${data.habits.length}`);
    lines.push(`Total Completions: ${data.stats.totalCompletions}`);
    lines.push(`Current Streak: ${data.stats.currentStreak} days`);
    lines.push(`Longest Streak: ${data.stats.longestStreak} days`);
    lines.push(`Monthly Rate: ${data.stats.monthlyRate}%`);
    lines.push("");
    lines.push("──────────────────────────────────────────");
    lines.push("YOUR HABITS");
    lines.push("──────────────────────────────────────────");

    data.habits.forEach((habit, i) => {
        lines.push(`${i + 1}. ${habit.name}`);
        if (habit.description) {
            lines.push(`   ${habit.description}`);
        }
        lines.push(`   Frequency: ${habit.frequency}`);
        lines.push("");
    });

    return lines.join("\n");
}
