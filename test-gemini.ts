// Test script to verify Gemini API connection
// Run with: npx ts-node test-gemini.ts

import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = process.env.GEMINI_API_KEY || "";

async function testConnection() {
    console.log("Testing Gemini API connection...");
    console.log("API Key present:", API_KEY ? `Yes (${API_KEY.substring(0, 8)}...)` : "NO - MISSING!");

    if (!API_KEY) {
        console.error("ERROR: GEMINI_API_KEY environment variable is not set.");
        process.exit(1);
    }

    const genAI = new GoogleGenerativeAI(API_KEY);

    // Try different model names
    const modelsToTry = [
        "gemini-1.5-flash",
        "gemini-1.5-pro",
        "gemini-pro",
        "models/gemini-1.5-flash",
        "models/gemini-pro"
    ];

    for (const modelName of modelsToTry) {
        console.log(`\nTrying model: ${modelName}`);
        try {
            const model = genAI.getGenerativeModel({ model: modelName });
            const result = await model.generateContent("Say hello in one word.");
            const text = result.response.text();
            console.log(`✅ SUCCESS with ${modelName}: "${text.trim()}"`);
            return; // Exit on first success
        } catch (error: any) {
            console.log(`❌ FAILED: ${error.message?.substring(0, 100) || error}`);
        }
    }

    console.log("\n❌ All models failed. Please check your API key permissions.");
}

testConnection();
