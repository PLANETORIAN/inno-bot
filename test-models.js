import { GoogleGenerativeAI } from "@google/generative-ai";
import { config } from "dotenv";

config();

const geminiKey = process.env.GEMINI_KEY;
console.log('API Key loaded:', geminiKey ? 'Yes' : 'No');
console.log('API Key length:', geminiKey ? geminiKey.length : 0);

const genAI = new GoogleGenerativeAI(geminiKey);

async function testSimpleGeneration() {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro-latest" });
    console.log('Model created successfully');
    
    const result = await model.generateContent("Hello, test message");
    console.log('Response:', result.response.text());
  } catch (error) {
    console.error('Error:', error.message);
    console.error('Status:', error.status);
  }
}

testSimpleGeneration();