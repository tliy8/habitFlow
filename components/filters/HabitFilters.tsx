"use client";

import { motion } from "framer-motion";
import { Filter, Calendar, List, Archive } from "lucide-react";
import { cn } from "@/lib/utils";

interface HabitFiltersProps {
    activeFilter: "all" | "active" | "archived";
    frequencyFilter: "all" | "daily" | "weekly";
    viewMode: "calendar" | "list";
    onActiveFilterChange: (filter: "all" | "active" | "archived") => void;
    onFrequencyFilterChange: (filter: "all" | "daily" | "weekly") => void;
    onViewModeChange: (mode: "calendar" | "list") => void;
}

export default function HabitFilters({
    activeFilter,
    frequencyFilter,
    viewMode,
    onActiveFilterChange,
    onFrequencyFilterChange,
    onViewModeChange,
}: HabitFiltersProps) {
    return (
        <div className="flex flex-wrap items-center gap-4 p-4 bg-white rounded-xl border shadow-sm">
            {/* Status Filter */}
            <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-gray-400" />
                <div className="flex bg-gray-100 rounded-lg p-1">
                    {(["all", "active", "archived"] as const).map((filter) => (
                        <button
                            key={filter}
                            onClick={() => onActiveFilterChange(filter)}
                            className={cn(
                                "px-3 py-1.5 text-sm font-medium rounded-md transition-all",
                                activeFilter === filter
                                    ? "bg-white text-gray-900 shadow-sm"
                                    : "text-gray-500 hover:text-gray-700"
                            )}
                        >
                            {filter === "all" ? "All" : filter === "active" ? "Active" : "Archived"}
                        </button>
                    ))}
                </div>
            </div>

            {/* Frequency Filter */}
            <div className="flex bg-gray-100 rounded-lg p-1">
                {(["all", "daily", "weekly"] as const).map((filter) => (
                    <button
                        key={filter}
                        onClick={() => onFrequencyFilterChange(filter)}
                        className={cn(
                            "px-3 py-1.5 text-sm font-medium rounded-md transition-all",
                            frequencyFilter === filter
                                ? "bg-white text-gray-900 shadow-sm"
                                : "text-gray-500 hover:text-gray-700"
                        )}
                    >
                        {filter === "all" ? "All" : filter === "daily" ? "Daily" : "Weekly"}
                    </button>
                ))}
            </div>

            {/* View Mode Toggle */}
            <div className="flex bg-gray-100 rounded-lg p-1 ml-auto">
                <button
                    onClick={() => onViewModeChange("calendar")}
                    className={cn(
                        "p-2 rounded-md transition-all",
                        viewMode === "calendar"
                            ? "bg-white text-violet-600 shadow-sm"
                            : "text-gray-500 hover:text-gray-700"
                    )}
                >
                    <Calendar className="h-4 w-4" />
                </button>
                <button
                    onClick={() => onViewModeChange("list")}
                    className={cn(
                        "p-2 rounded-md transition-all",
                        viewMode === "list"
                            ? "bg-white text-violet-600 shadow-sm"
                            : "text-gray-500 hover:text-gray-700"
                    )}
                >
                    <List className="h-4 w-4" />
                </button>
            </div>
        </div>
    );
}
