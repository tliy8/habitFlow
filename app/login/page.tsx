"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { signIn } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, Zap, AlertCircle, CheckCircle } from "lucide-react"

export default function LoginPage() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState("")

    const registered = searchParams.get("registered")

    async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault()
        setIsLoading(true)
        setError("")

        const formData = new FormData(event.currentTarget)
        const email = formData.get("email") as string
        const password = formData.get("password") as string

        try {
            const result = await signIn("credentials", {
                email,
                password,
                redirect: false,
            })

            if (result?.error) {
                setError("Invalid email or password")
                setIsLoading(false)
                return
            }

            router.push("/dashboard")
            router.refresh()
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
                        <h1 className="text-2xl font-bold text-gray-900">Welcome back</h1>
                        <p className="text-gray-500 mt-1">Sign in to continue to HabitFlow</p>
                    </div>

                    {/* Form */}
                    <form onSubmit={onSubmit} className="px-8 pb-8">
                        {/* Success Message */}
                        <AnimatePresence>
                            {registered && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="flex items-center gap-2 p-3 mb-4 bg-green-50 border border-green-200 rounded-xl text-sm text-green-700"
                                >
                                    <CheckCircle className="h-4 w-4 flex-shrink-0" />
                                    <span>Account created! Please sign in.</span>
                                </motion.div>
                            )}
                        </AnimatePresence>

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
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="password" className="text-gray-700">Password</Label>
                                    <Link href="#" className="text-sm text-violet-600 hover:text-violet-700">
                                        Forgot password?
                                    </Link>
                                </div>
                                <Input
                                    id="password"
                                    name="password"
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
                            {isLoading ? "Signing in..." : "Sign in"}
                        </button>

                        <p className="text-center text-sm text-gray-500 mt-6">
                            Don't have an account?{" "}
                            <Link href="/register" className="text-violet-600 hover:text-violet-700 font-medium">
                                Sign up
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
