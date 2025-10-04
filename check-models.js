import { GoogleGenerativeAI } from "@google/generative-ai";
import { config } from "dotenv";

config();

const geminiKey = process.env.GEMINI_KEY;
const genAI = new GoogleGenerativeAI(geminiKey);

async function listAvailableModels() {
  try {
    console.log('🔍 Checking available Google AI models...\n');
    
    // Try different model names that might work
    const modelsToTest = [
      'gemini-pro',
      'gemini-1.5-pro',
      'gemini-1.5-flash',
      'gemini-1.0-pro', 
      'models/gemini-pro',
      'models/gemini-1.5-pro',
      'models/gemini-1.5-flash'
    ];
    
    console.log('Testing models:');
    for (const modelName of modelsToTest) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent("Hello");
        console.log(`✅ ${modelName} - WORKS`);
      } catch (error) {
        console.log(`❌ ${modelName} - FAILED: ${error.message.substring(0, 100)}...`);
      }
    }
    
    console.log('\n🔍 Attempting to list all available models...');
    
    // Try to list models (if API supports it)
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${geminiKey}`);
      if (response.ok) {
        const data = await response.json();
        console.log('\n📋 Available models from API:');
        data.models?.forEach(model => {
          console.log(`   - ${model.name} (${model.displayName})`);
        });
      } else {
        console.log('❌ Could not fetch model list from API');
      }
    } catch (listError) {
      console.log('❌ Error listing models:', listError.message);
    }
    
  } catch (error) {
    console.error('❌ Error checking models:', error.message);
  }
}

listAvailableModels();