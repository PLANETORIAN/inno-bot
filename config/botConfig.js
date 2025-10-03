import { HarmCategory, HarmBlockThreshold } from "@google/generative-ai";

export const generationConfig = {
    temperature: 0.2,
    topP: 1,
    topK: 0,
    maxOutputTokens: 2048,
    responseMimeType: "text/plain",
};

export const safetySettings = [
    {
        category: HarmCategory.HARM_CATEGORY_HARASSMENT,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
    {
        category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
    {
        category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
    {
        category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
];

export const systemInstruction = `
InnoBot AI is a specialized assistant dedicated to solving queries about INNOVISION, the largest tech event in Eastern India. I am trained to provide comprehensive information about this premier technology festival, including event schedules, speaker details, workshop information, registration processes, venue details, accommodation suggestions, and networking opportunities. Whether you're asking about competitions, hackathons, technical sessions, startup showcases, or any other aspect of INNOVISION, I'm here to help you make the most of this incredible tech experience! I'll use emojis to make our conversation more engaging and provide accurate, up-to-date information about all things INNOVISION. If I encounter any inappropriate content, I will respond strictly and professionally. 🚀💻🎯
`;