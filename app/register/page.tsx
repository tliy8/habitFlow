"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, Zap, AlertCircle } from "lucide-react"

export default function RegisterPage() {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState("")

    async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault()
        setIsLoading(true)
        setError("")

        const formData = new FormData(event.currentTarget)
        const name = formData.get("name") as string
        const email = formData.get("email") as string
        const password = formData.get("password") as string
        const confirmPassword = formData.get("confirmPassword") as string

        if (password !== confirmPassword) {
            setError("Passwords do not match")
            setIsLoading(false)
            return
        }

        if (password.length < 6) {
            setError("Password must be at least 6 characters")
            setIsLoading(false)
            return
        }

        try {
            const res = await fetch("/api/auth/register", {
                method: "POST",
                body: JSON.stringify({ name, email, password }),
                headers: { "Content-Type": "application/json" },
            })

            const data = await res.json()

            if (!res.ok) {
                setError(data.error || "Something went wrong")
                setIsLoading(false)
                return
            }

            router.push("/login?registered=true")
        } catch (error) {
            setError("Something went wrong. Please try again.")
            setIsLoading(false)
        }
    }

    return (
        <div className="flex min-h-screen items-center justify-center px-4 py-12 bg-gradient-to-br from-violet-50 via-white to-purple-50">
            {/* Background Elements */}
            <div className="absolute inset-0 -z-10 overflow-hidden">
                <div className="absolute top-1/4 -left-32 w-64 h-64 bg-violet-200 rounded-full blur-3xl opacity-50" />
                <div className="absolute bottom-1/4 -right-32 w-64 h-64 bg-purple-200 rounded-full blur-3xl opacity-50" />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md"
            >
                <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                    {/* Header */}
                    <div className="px-8 pt-8 pb-6 text-center">
                        <div className="flex items-center justify-center mb-6">
                            <div className="p-3 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl">
                                <Zap className="h-6 w-6 text-white" />
                            </div>
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900">Create your account</h1>
                        <p className="text-gray-500 mt-1">Start tracking your habits today</p>
                    </div>

                    {/* Form */}
                    <form onSubmit={onSubmit} className="px-8 pb-8">
                        {/* Error Message */}
                        <AnimatePresence>
                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="flex items-center gap-2 p-3 mb-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700"
                                >
                                    <AlertCircle className="h-4 w-4 flex-shrink-0" />
                                    <span>{error}</span>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="name" className="text-gray-700">Name</Label>
                                <Input
                                    id="name"
                                    name="name"
                                    type="text"
                                    placeholder="Your name"
                                    required
                                    disabled={isLoading}
                                    className="h-12 border-gray-200 focus:border-violet-500 focus:ring-violet-500"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email" className="text-gray-700">Email</Label>
                                <Input
                                    id="email"
                                    name="email"
                                    type="email"
                                    placeholder="you@example.com"
                                    required
                                    disabled={isLoading}
                                    className="h-12 border-gray-200 focus:border-violet-500 focus:ring-violet-500"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="password" className="text-gray-700">Password</Label>
                                <Input
                                    id="password"
                                    name="password"
                                    type="password"
                                    placeholder="At least 6 characters"
                                    required
                                    disabled={isLoading}
                                    className="h-12 border-gray-200 focus:border-violet-500 focus:ring-violet-500"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="confirmPassword" className="text-gray-700">Confirm Password</Label>
                                <Input
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    type="password"
                                    required
                                    disabled={isLoading}
                                    className="h-12 border-gray-200 focus:border-violet-500 focus:ring-violet-500"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full h-12 mt-6 text-white font-semibold bg-gradient-to-r from-violet-600 to-purple-600 rounded-xl hover:from-violet-700 hover:to-purple-700 transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                            {isLoading ? "Creating account..." : "Create account"}
                        </button>

                        <p className="text-center text-sm text-gray-500 mt-6">
                            Already have an account?{" "}
                            <Link href="/login" className="text-violet-600 hover:text-violet-700 font-medium">
                                Sign in
                            </Link>
                        </p>
                    </form>
                </div>

                {/* Back to home */}
                <p className="text-center text-sm text-gray-400 mt-6">
                    <Link href="/" className="hover:text-gray-600 transition-colors">
                        ← Back to home
                    </Link>
                </p>
            </motion.div>
        </div>
    )
}
