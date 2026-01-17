"use client";

import { useState, useEffect, useRef } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Play } from "lucide-react";
import HeatmapPreview from "./HeatmapPreview";
import QuickPanel from "./QuickPanel";

// Analytics helper (placeholder - integrate with your analytics provider)
const trackEvent = (event: string, properties?: Record<string, any>) => {
    if (typeof window !== "undefined" && (window as any).gtag) {
        (window as any).gtag("event", event, properties);
    }
    console.log("[Analytics]", event, properties);
};

interface HeroProps {
    headlineVariant?: "A" | "B" | "C";
    ctaVariant?: "A" | "B";
    onSignupClick?: () => void;
}

const HEADLINES = {
    A: "Build momentum.\nKeep the streak.",
    B: "Win the day.\nEvery day.",
    C: "Your habits,\nvisualized.",
};

const CTA_OPTIONS = {
    A: { primary: "Start my streak — Free", secondary: "See it in 30s" },
    B: { primary: "Try free for 14 days", secondary: "Watch demo" },
};

export default function Hero({
    headlineVariant = "A",
    ctaVariant = "A",
    onSignupClick,
}: HeroProps) {
    const prefersReducedMotion = useReducedMotion();
    const [selectedDate, setSelectedDate] = useState<string | null>(null);
    const [completedHabits, setCompletedHabits] = useState<Set<string>>(new Set());
    const heroRef = useRef<HTMLDivElement>(null);

    // Demo habits data
    const demoHabits = [
        { id: "1", name: "Morning Run", color: "#10b981" },
        { id: "2", name: "Read 30 min", color: "#3b82f6" },
        { id: "3", name: "Drink Water", color: "#f59e0b" },
        { id: "4", name: "Meditate", color: "#8b5cf6" },
    ];

    // Handle demo completion
    const handleSimulateComplete = (habitId: string) => {
        trackEvent("preview_simulate_complete", { habitId });
        setCompletedHabits((prev) => {
            const next = new Set(prev);
            if (next.has(habitId)) {
                next.delete(habitId);
            } else {
                next.add(habitId);
            }
            return next;
        });
    };

    // Handle date hover
    const handleDateHover = (dateKey: string) => {
        trackEvent("preview_hover_date", { date: dateKey });
    };

    // Handle CTA click
    const handlePrimaryClick = () => {
        trackEvent("hero_cta_click", { variant: ctaVariant, type: "primary" });
        trackEvent("signup_start");
        onSignupClick?.();
    };

    const handleSecondaryClick = () => {
        trackEvent("hero_cta_click", { variant: ctaVariant, type: "secondary" });
        // Scroll to demo or open demo modal
        document.getElementById("demo-section")?.scrollIntoView({ behavior: "smooth" });
    };

    // Animation variants
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: prefersReducedMotion ? 0 : 0.1,
                delayChildren: prefersReducedMotion ? 0 : 0.2,
            },
        },
    };

    const itemVariants = {
        hidden: { opacity: 0, y: prefersReducedMotion ? 0 : 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: prefersReducedMotion ? 0.2 : 0.6, ease: "easeOut" },
        },
    };

    return (
        <section
            ref={heroRef}
            className="min-h-[calc(100vh-64px)] bg-gradient-to-br from-violet-50 via-white to-purple-50/50 overflow-hidden"
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
                    {/* LEFT: Interactive Calendar Preview (Desktop) / Hidden on mobile until after CTA */}
                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        className="order-2 lg:order-1"
                    >
                        <motion.div variants={itemVariants}>
                            <HeatmapPreview
                                completedHabits={completedHabits}
                                totalHabits={demoHabits.length}
                                selectedDate={selectedDate}
                                onDateClick={setSelectedDate}
                                onDateHover={handleDateHover}
                                reducedMotion={prefersReducedMotion || false}
                            />
                        </motion.div>
                    </motion.div>

                    {/* RIGHT: Headline + CTA */}
                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        className="order-1 lg:order-2 text-center lg:text-left"
                    >
                        {/* Headline */}
                        <motion.h1
                            variants={itemVariants}
                            className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 tracking-tight whitespace-pre-line"
                        >
                            {HEADLINES[headlineVariant]}
                        </motion.h1>

                        {/* Subheadline */}
                        <motion.p
                            variants={itemVariants}
                            className="mt-6 text-lg sm:text-xl text-gray-600 max-w-lg mx-auto lg:mx-0"
                        >
                            A calendar-first habit system that helps you win every day — without the guilt.
                        </motion.p>

                        {/* CTAs */}
                        <motion.div
                            variants={itemVariants}
                            className="mt-8 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
                        >
                            {/* Primary CTA */}
                            <button
                                onClick={handlePrimaryClick}
                                className="group inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-violet-600 to-purple-600 text-white font-semibold rounded-xl shadow-lg shadow-violet-500/25 hover:shadow-xl hover:shadow-violet-500/30 hover:scale-105 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-violet-500/50"
                                aria-label={CTA_OPTIONS[ctaVariant].primary}
                            >
                                {CTA_OPTIONS[ctaVariant].primary}
                                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                            </button>

                            {/* Secondary CTA */}
                            <button
                                onClick={handleSecondaryClick}
                                className="inline-flex items-center justify-center gap-2 px-6 py-4 text-violet-700 font-medium hover:text-violet-800 hover:bg-violet-100 rounded-xl transition-colors focus:outline-none focus:ring-4 focus:ring-violet-500/30"
                                aria-label={CTA_OPTIONS[ctaVariant].secondary}
                            >
                                <Play className="h-5 w-5" />
                                {CTA_OPTIONS[ctaVariant].secondary}
                            </button>
                        </motion.div>

                        {/* Social proof (optional) */}
                        <motion.p
                            variants={itemVariants}
                            className="mt-6 text-sm text-gray-500"
                        >
                            Join 10,000+ people building better habits
                        </motion.p>
                    </motion.div>
                </div>
            </div>

            {/* Quick Panel - slides in when date selected */}
            <QuickPanel
                isOpen={!!selectedDate}
                onClose={() => setSelectedDate(null)}
                date={selectedDate}
                habits={demoHabits}
                completedHabits={completedHabits}
                onToggle={handleSimulateComplete}
                reducedMotion={prefersReducedMotion || false}
            />
        </section>
    );
}
