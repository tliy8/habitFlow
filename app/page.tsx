"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Zap, ArrowRight, Check, Shield, TrendingUp, Calendar, Flame, Target } from "lucide-react";
import Hero from "@/components/landing/Hero";

export default function LandingPage() {
  const [signupModalOpen, setSignupModalOpen] = useState(false);

  const handleSignupClick = () => {
    // Navigate to register page
    window.location.href = "/register";
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="p-2 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl">
                <Zap className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">HabitFlow</span>
            </div>

            {/* Nav Links */}
            <div className="flex items-center gap-4">
              <Link
                href="/login"
                className="text-gray-600 hover:text-gray-900 font-medium transition-colors"
              >
                Log in
              </Link>
              <Link
                href="/register"
                className="px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white font-medium rounded-lg transition-colors"
              >
                Sign up free
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Spacer for fixed nav */}
      <div className="h-16" />

      {/* Hero Section */}
      <Hero
        headlineVariant="A"
        ctaVariant="A"
        onSignupClick={handleSignupClick}
      />

      {/* Features Section */}
      <section id="demo-section" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Why HabitFlow works
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Simple, visual, and designed for real life — not perfection.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: Calendar,
                title: "Calendar-first design",
                description: "See your consistency at a glance. Every day is a story, every week a chapter.",
                color: "violet",
              },
              {
                icon: Flame,
                title: "Streaks that motivate",
                description: "Build momentum with visual streaks. Miss a day? Tomorrow is a clean page.",
                color: "orange",
              },
              {
                icon: Target,
                title: "Focus on progress",
                description: "No punishment, no guilt. Just gentle encouragement to keep showing up.",
                color: "emerald",
              },
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="p-8 rounded-2xl bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                <div className={`
                  inline-flex p-3 rounded-xl mb-6
                  ${feature.color === "violet" ? "bg-violet-100" : ""}
                  ${feature.color === "orange" ? "bg-orange-100" : ""}
                  ${feature.color === "emerald" ? "bg-emerald-100" : ""}
                `}>
                  <feature.icon className={`
                    h-6 w-6
                    ${feature.color === "violet" ? "text-violet-600" : ""}
                    ${feature.color === "orange" ? "text-orange-600" : ""}
                    ${feature.color === "emerald" ? "text-emerald-600" : ""}
                  `} />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-16 bg-gradient-to-b from-white to-violet-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-4">
              {[1, 2, 3, 4, 5].map((star) => (
                <motion.svg
                  key={star}
                  initial={{ opacity: 0, scale: 0 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: star * 0.1 }}
                  className="h-6 w-6 text-yellow-400 fill-current"
                  viewBox="0 0 20 20"
                >
                  <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                </motion.svg>
              ))}
            </div>
            <p className="text-lg text-gray-700 font-medium mb-2">
              "Finally, a habit app that doesn't make me feel guilty."
            </p>
            <p className="text-gray-500">— Sarah M., building a 47-day streak</p>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-gradient-to-br from-violet-600 to-purple-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl sm:text-4xl font-bold text-white mb-6"
          >
            Ready to build your streak?
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-lg text-violet-100 mb-8 max-w-xl mx-auto"
          >
            Join thousands of people who are building better habits, one day at a time.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <Link
              href="/register"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white text-violet-700 font-semibold rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all"
            >
              Start my streak — Free
              <ArrowRight className="h-5 w-5" />
            </Link>
          </motion.div>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="mt-6 text-sm text-violet-200"
          >
            No credit card required • Free forever for basic features
          </motion.p>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-violet-600 rounded-lg">
                <Zap className="h-4 w-4 text-white" />
              </div>
              <span className="font-semibold text-white">HabitFlow</span>
            </div>
            <p className="text-gray-400 text-sm">
              © 2026 HabitFlow. Build better habits.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
