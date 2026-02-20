/**
 * ai.js
 * 
 * "The Brain" of the application.
 * Handles all communication with the AI Service (Groq Cloud).
 * 
 * Capabilities:
 * 1. Chat Mentor (Llama 3)
 * 2. Grammar Checker
 * 3. Smart Dictionary (Meanings & Examples)
 */
import Groq from "groq-sdk";

// API Key Groq dari environment variables
const API_KEY = import.meta.env.VITE_GROQ_API_KEY;

// Inisialisasi Groq client
let groq = new Groq({
    apiKey: API_KEY,
    dangerouslyAllowBrowser: true // Diperlukan karena kita jalan di sisi client (browser)
});

/**
 * 1. CHAT GENERATOR
 * Generates chat responses for the Mentor Game.
 * Uses history to maintain context.
 */
export const generateAIResponse = async (prompt, systemInstruction = "", history = []) => {
    try {
        const chatMessages = [
            {
                role: "system",
                content: systemInstruction || "You are a helpful English language mentor."
            },
            ...history.map(h => ({
                role: h.role === 'user' ? 'user' : 'assistant',
                content: h.content
            })),
            {
                role: "user",
                content: prompt
            }
        ];

        const completion = await groq.chat.completions.create({
            messages: chatMessages,
            model: "llama-3.3-70b-versatile", // Model paling pintar dan kencang di Groq saat ini
            temperature: 0.7,
            max_tokens: 1024,
        });

        return completion.choices[0]?.message?.content || "";

    } catch (error) {
        console.error("Groq AI Error:", error);

        if (error.status === 401) {
            throw new Error("API Key Groq tidak valid.");
        }
        if (error.status === 429) {
            throw new Error("Batas pemakaian (Rate Limit) Groq tercapai. Tunggu sebentar.");
        }

        throw new Error(`Gagal memanggil Groq: ${error.message}`);
    }
};

/**
 * 2. GRAMMAR POLICE
 * Analyzes the user's sentence for errors.
 * Returns JSON: { hasErrors, correction, explanation }
 */
export const analyzeGrammar = async (text) => {
    try {
        const completion = await groq.chat.completions.create({
            messages: [
                {
                    role: "system",
                    content: "You are an English teacher. Analyze grammar errors. Return ONLY JSON: {\"hasErrors\":boolean, \"correction\":string, \"explanation\":string}"
                },
                {
                    role: "user",
                    content: `Analyze this text: "${text}"`
                }
            ],
            model: "llama-3.3-70b-versatile",
            response_format: { type: "json_object" } // Groq mendukung format JSON langsung
        });

        return JSON.parse(completion.choices[0]?.message?.content || "{}");
    } catch (error) {
        console.error("Grammar Analysis (Groq) Error:", error);
        return null;
    }
};

/**
 * 3. SMART DICTIONARY
 * Generates comprehensive details for a word (Meanings + Examples + CEFR) using AI.
 * Called when user clicks the "Wand" button in Add Word Modal.
 */
export const generateWordDetails = async (word) => {
    try {
        const completion = await groq.chat.completions.create({
            messages: [
                {
                    role: "system",
                    content: "You are an English teacher. For the user's word, provide:\n1. 3-5 Indonesian meanings (synonyms/variations).\n2. 3 simple, clear example sentences (10-15 words max) WITH their Indonesian translation.\n3. The CEFR level (exact code only: A1, A2, B1, B2, C1, or C2).\n\nOutput strictly valid JSON: { \"meanings\": [\"...\"], \"examples\": [{ \"text\": \"English sentence\", \"translation\": \"Terjemahan Indonesia\" }], \"cefr\": \"B2\" }"
                },
                {
                    role: "user",
                    content: `Word: "${word}"`
                }
            ],
            model: "llama-3.3-70b-versatile",
            response_format: { type: "json_object" }
        });

        const validJSON = completion.choices[0]?.message?.content || "{}";
        console.log("Raw AI Response:", validJSON); // Debug Log

        return JSON.parse(validJSON);
    } catch (error) {
        console.error("Word Details (Groq - Debug) Error:", error);
        return null; // Return null so UI knows it failed
    }
};

export const initAI = (customKey) => {
    // Hanya update jika key baru tidak kosong dan bukan key yang sedang dipakai
    if (customKey && customKey.trim() !== "" && customKey.startsWith("gsk_")) {
        groq = new Groq({
            apiKey: customKey,
            dangerouslyAllowBrowser: true
        });
        return true;
    }

    // Jika tidak ada key custom, pastikan kita punya default key
    return !!API_KEY;
};
