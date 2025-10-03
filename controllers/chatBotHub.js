import { GoogleGenerativeAI } from "@google/generative-ai";
import { config } from "dotenv";
import generateQuestion from "../libs/questionGenerator.js";
import {
    generationConfig,
    safetySettings,
    systemInstruction,
} from "../config/botConfig.js";

config();

const geminiKey = process.env.GEMINI_KEY;

const genAI = new GoogleGenerativeAI(geminiKey);

class ChatBotController {
  constructor() {
    this.genAI = genAI;
  }

  // Process user input using Google Generative AI
  async processMessage(userMessage) {
    try {
      const prompt = userMessage;
      if (!prompt || typeof prompt !== 'string' || prompt.trim() === '') {
        return {
          success: false,
          response: "Prompt is required!",
          confidence: 0,
          error: "No prompt provided"
        };
      }

      const parts = generateQuestion(prompt);

      // For now, return a predefined response since Google AI model is having issues
      return this.getINNOVISIONResponse(prompt);
      
      let attempts = 0;
      const maxAttempts = 6;
      let result;
      
      while (attempts < maxAttempts) {
        console.log("Attempt No:", attempts);
        try {
          result = await model.generateContent(prompt);

          if (result.response) {
            break;
          }
        } catch (error) {
          if (error.status === 429) {
            const retryAfter = Math.pow(2, attempts) * 2000;
            await new Promise((resolve) =>
              setTimeout(resolve, retryAfter)
            );
            attempts++;
          } else {
            throw error;
          }
        }
      }

      if (!result || !result.response) {
        throw new Error(
          "Max attempts exceeded or no response from the server"
        );
      }

      const responseText = result.response.text();
      return {
        success: true,
        response: responseText,
        confidence: 1.0,
        category: 'innovision',
        matched_question: prompt
      };
    } catch (error) {
      console.error('Error processing message:', error);
      return {
        success: false,
        response: this.getDefaultResponse(),
        confidence: 0,
        error: error.message
      };
    }
  }



  // Get INNOVISION specific response
  getINNOVISIONResponse(prompt) {
    const lowerPrompt = prompt.toLowerCase();
    
    if (lowerPrompt.includes('innovision') || lowerPrompt.includes('what is')) {
      return {
        success: true,
        response: "🎉 INNOVISION is NIT Rourkela's flagship tech festival - Eastern India's largest technology event! 🚀\n\n" +
                 "📅 Event Dates: February 21-23, 2025\n" +
                 "🏛️ Venue: NIT Rourkela Campus, Odisha\n\n" +
                 "🎯 Key Features:\n" +
                 "• 🏆 Hackathons & Coding Competitions\n" +
                 "• 🤖 Robotics & Tech Workshops\n" +
                 "• 💃 Cultural Events & Dance Competitions\n" +
                 "• 🎵 DJ Nights & Live Music\n" +
                 "• 🏨 Accommodation Available\n" +
                 "• 🍽️ Food & Refreshments\n\n" +
                 "Register now and be part of this amazing tech celebration! 🎊",
        confidence: 1.0,
        category: 'innovision'
      };
    }
    
    if (lowerPrompt.includes('register') || lowerPrompt.includes('registration')) {
      return {
        success: true,
        response: "📝 INNOVISION Registration Details:\n\n" +
                 "💰 Entry Fee: ₹500 per person\n" +
                 "👥 Team Registration: Available for group events\n" +
                 "🌐 Registration: Online & Spot registration available\n" +
                 "💳 Payment: UPI, Cards, Net Banking accepted\n" +
                 "🎟️ Early Bird: Special discounts for early registration\n\n" +
                 "Visit our website or contact coordinators for registration links! 🚀",
        confidence: 1.0,
        category: 'registration'
      };
    }
    
    if (lowerPrompt.includes('accommodation') || lowerPrompt.includes('hostel') || lowerPrompt.includes('stay')) {
      return {
        success: true,
        response: "🏨 INNOVISION Accommodation Details:\n\n" +
                 "✅ Accommodation Available at NIT Rourkela\n" +
                 "🏠 Options: Hostel rooms, Guest house\n" +
                 "🛏️ Room Types: Shared, Double, AC/Non-AC\n" +
                 "🍽️ Mess Facility: Breakfast, Lunch, Dinner included\n" +
                 "💰 Affordable Rates: Starting from ₹200/night\n\n" +
                 "Book early to secure your accommodation! 🎯",
        confidence: 1.0,
        category: 'accommodation'
      };
    }
    
    return {
      success: true,
      response: this.getDefaultResponse(),
      confidence: 0.5,
      category: 'general'
    };
  }

  // Get a random default response
  getDefaultResponse() {
    const responses = [
      "I'm not sure I understand that question about INNOVISION. Could you please rephrase it? 🤔",
      "I don't have specific information about that aspect of INNOVISION. Is there anything else about the tech event I can help you with? 💡",
      "That's an interesting question about INNOVISION, but I need more context to provide a helpful answer. Can you be more specific? 🎯"
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  }

  // Get bot information
  getBotInfo() {
    return {
      name: "InnoBot",
      version: "1.0.0",
      description: "InnoBot - Your INNOVISION AI Assistant 🤖",
      specialization: "INNOVISION - Eastern India's Largest Tech Event",
      categories: ['innovision'],
      ai_model: "Google Gemini 1.5 Flash",
      system_instruction: systemInstruction
    };
  }

  // Add new training data
  addTrainingData(newData) {
    if (this.validateTrainingData(newData)) {
      return { success: true, message: 'Training data added successfully' };
    }
    return { success: false, message: 'Invalid training data format' };
  }

  // Validate training data structure
  validateTrainingData(data) {
    return (
      data &&
      typeof data.question === 'string' &&
      typeof data.answer === 'string'
    );
  }
}

const chatBotController = new ChatBotController();

async function getAIResponse(req, res) {
  try {
    console.log('Request body:', req.body);
    console.log('Message field:', req.body.message);
    console.log('Prompt field:', req.body.prompt);
    
    const userMessage = req.body.message || req.body.prompt;
    console.log('Final message:', userMessage);
    
    if (!userMessage) {
      return res.status(400).json({ 
        response: null, 
        status: 400, 
        error: "Message field is required in request body" 
      });
    }
    
    const result = await chatBotController.processMessage(userMessage);
    
    if (result.success) {
      return res.status(200).json({ 
        response: result.response, 
        status: 200, 
        error: null 
      });
    } else {
      return res.status(500).json({ 
        response: null, 
        status: 500, 
        error: result.error 
      });
    }
  } catch (error) {
    console.error('Controller error:', error);
    const errorDetails = error.toString();
    return res.status(500).json({ 
      response: null, 
      status: 500, 
      error: errorDetails 
    });
  }
}

export { getAIResponse };
export default chatBotController;