import { GoogleGenerativeAI, GenerativeModel } from "@google/generative-ai";

// Initialize Gemini client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

// Get model instance - use gemini-1.5-flash (fast & cost-effective)
export function getModel(): GenerativeModel {
    return genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
}

// Generate text with Gemini
export async function generateText(prompt: string, systemPrompt?: string): Promise<string> {
    const model = getModel();

    const fullPrompt = systemPrompt
        ? `${systemPrompt}\n\nUser: ${prompt}`
        : prompt;

    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    return response.text();
}

// Generate structured JSON response
export async function generateJSON<T>(
    prompt: string,
    systemPrompt: string,
    schema: string
): Promise<T | null> {
    const model = getModel();

    const fullPrompt = `${systemPrompt}

IMPORTANT: Respond with valid JSON only. No markdown, no explanation.
Expected schema: ${schema}

User input: ${prompt}`;

    try {
        const result = await model.generateContent(fullPrompt);
        const response = await result.response;
        const text = response.text().trim();

        // Clean potential markdown wrapping
        const cleaned = text
            .replace(/^```json\n?/i, "")
            .replace(/\n?```$/i, "")
            .trim();

        return JSON.parse(cleaned) as T;
    } catch (error) {
        console.error("[Gemini] JSON parse error:", error);
        return null;
    }
}
