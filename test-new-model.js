import { GoogleGenerativeAI } from "@google/generative-ai";
import { config } from "dotenv";

config();

const geminiKey = process.env.GEMINI_KEY;
const genAI = new GoogleGenerativeAI(geminiKey);

async function testNewModel() {
  try {
    console.log('🧪 Testing Gemini 2.5 Flash model...\n');
    
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash"
    });
    
    const result = await model.generateContent("Hello! Tell me about INNOVISION tech festival in one sentence.");
    
    if (result && result.response) {
      const responseText = result.response.text();
      console.log('✅ SUCCESS! Model response:');
      console.log(responseText);
    } else {
      console.log('❌ No response received');
    }
    
  } catch (error) {
    console.error('❌ Error testing model:', error.message);
  }
}

testNewModel();