import { GoogleGenerativeAI } from "@google/generative-ai";
import { ApiError } from "../utils/ApiError.js";

// Initialize the Google Generative AI with the API key from environment variables
const getGenAI = () => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        throw new ApiError(500, "Gemini API Key is missing in environment configuration");
    }
    return new GoogleGenerativeAI(apiKey);
};

export const generateArticleSummary = async (content) => {
    // A robust list of models to fallback to in case of 503 High Demand spikes
    const fallbackModels = [
        "gemini-3.7-flash",
        "gemini-flash-latest",
        "gemini-3.5-flash-lite",
        "gemini-2.5-flash-lite",
        "gemini-pro-latest"
    ];

    let lastError = null;
    const genAI = getGenAI();

    // Truncate content if it's exceptionally long to save tokens
    const contentToSummarize = content.length > 50000 ? content.substring(0, 50000) : content;
    const prompt = `You are an expert editorial writer. Read the following article content and provide a concise, engaging, and professional summary suitable for a preview or abstract. 
Rules:
1. Maximum 2 to 4 sentences.
2. Tone should be objective but captivating, like a high-end magazine.
3. Only return the summary text itself. Do not include quotes, prefixes like "Summary:", or conversational filler.

Article Content:
${contentToSummarize}`;

    for (const modelName of fallbackModels) {
        try {
            const model = genAI.getGenerativeModel({ model: modelName });
            const result = await model.generateContent(prompt);
            return result.response.text().trim();
        } catch (error) {
            console.error(`AI Model [${modelName}] Error:`, error.message);
            lastError = error;
            // If it's not a 503/500 demand error, it might be an auth issue and no models will work, but we keep trying anyway to be safe
        }
    }

    console.error("All AI fallback models failed. Last Error:", lastError);
    throw new ApiError(500, `Failed to generate AI summary after trying all fallback models: ${lastError?.message}`);
};
