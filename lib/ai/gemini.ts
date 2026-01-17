import { GoogleGenerativeAI, GenerativeModel } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export function getModel(): GenerativeModel {
    return genAI.getGenerativeModel({
        model: "gemini-1.0-pro"
    });
}

export async function generateText(
    prompt: string,
    systemPrompt?: string
): Promise<string> {
    const model = getModel();

    const fullPrompt = systemPrompt
        ? `${systemPrompt}\n\n${prompt}`
        : prompt;

    const result = await model.generateContent(fullPrompt);
    return result.response.text();
}

export async function generateJSON<T>(
    prompt: string,
    systemPrompt: string,
    schema: string
): Promise<T | null> {
    const model = getModel();

    const fullPrompt = `
${systemPrompt}

You must respond with ONLY raw JSON.
No markdown.
No explanation.
No extra text.
If you include anything other than JSON, the response is invalid.

Expected schema:
${schema}

User input:
${prompt}
`;

    try {
        const result = await model.generateContent(fullPrompt);
        const text = result.response.text().trim();

        const cleaned = text
            .replace(/^```json\s*/i, "")
            .replace(/```$/i, "")
            .trim();

        if (!cleaned || cleaned.length < 2) {
            throw new Error("Empty AI response");
        }

        return JSON.parse(cleaned) as T;
    } catch (error) {
        console.error("[Gemini] JSON parse error:", error);
        return null;
    }
}
