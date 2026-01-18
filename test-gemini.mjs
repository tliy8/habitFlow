// Test script to verify Gemini API connection
// Run with: node test-gemini.mjs

import { GoogleGenerativeAI } from "@google/generative-ai";

// Hardcode the API key for testing (from .env)
const API_KEY = "AIzaSyA4ctSayAK7215swDsQqUBoimjr0f70M1M";

async function testConnection() {
    console.log("Testing Gemini API connection...");
    console.log("API Key:", API_KEY.substring(0, 12) + "...");

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
            console.log(`SUCCESS with ${modelName}: "${text.trim()}"`);
            return; // Exit on first success
        } catch (error) {
            console.log(`FAILED: ${error.message?.substring(0, 120) || error}`);
        }
    }

    console.log("\nAll models failed. Please check your API key permissions.");
}

testConnection();
