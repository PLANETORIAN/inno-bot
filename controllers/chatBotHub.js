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

      const model = this.genAI.getGenerativeModel({
        model: "gemini-pro"
      });
      
      let attempts = 0;
      const maxAttempts = 6;
      let result;
      
      while (attempts < maxAttempts) {
        console.log("Attempt No:", attempts);
        try {
          result = await model.generateContent({
            contents: [{ role: "user", parts: parts || [] }],
            safetySettings,
            generationConfig,
          });

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
    
    // Registration related questions
    if (lowerPrompt.includes('register') || lowerPrompt.includes('registration') || 
        lowerPrompt.includes('how to register') || lowerPrompt.includes('sign up') ||
        lowerPrompt.includes('entry fee') || lowerPrompt.includes('fee') || lowerPrompt.includes('cost')) {
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
    
    // Accommodation related questions
    if (lowerPrompt.includes('accommodation') || lowerPrompt.includes('hostel') || 
        lowerPrompt.includes('stay') || lowerPrompt.includes('room') || 
        lowerPrompt.includes('lodge') || lowerPrompt.includes('place to stay')) {
      return {
        success: true,
        response: "🏨 INNOVISION Accommodation Details:\n\n" +
                 "✅ Accommodation Available at NIT Rourkela\n" +
                 "🏠 Options: Hostel rooms, Guest house\n" +
                 "🛏️ Room Types: Shared, Double, AC/Non-AC\n" +
                 "�️ Mess Facility: Breakfast, Lunch, Dinner included\n" +
                 "💰 Affordable Rates: Starting from ₹200/night\n\n" +
                 "Book early to secure your accommodation! 🎯",
        confidence: 1.0,
        category: 'accommodation'
      };
    }
    
    // Hackathon and coding related questions
    if (lowerPrompt.includes('hackathon') || lowerPrompt.includes('coding') || 
        lowerPrompt.includes('programming') || lowerPrompt.includes('competition') ||
        lowerPrompt.includes('contest') || lowerPrompt.includes('tech event')) {
      return {
        success: true,
        response: "🏆 INNOVISION Tech Competitions:\n\n" +
                 "💻 Hackathons: 24/48 hour coding challenges\n" +
                 "⚡ Programming Contests: Algorithmic problem solving\n" +
                 "🤖 Robotics Competitions: Build and compete\n" +
                 "🧠 AI/ML Challenges: Machine learning projects\n" +
                 "🌐 Web Development: Frontend/Backend contests\n" +
                 "📱 App Development: Mobile app competitions\n\n" +
                 "Win exciting prizes and showcase your skills! 🚀",
        confidence: 1.0,
        category: 'tech_events'
      };
    }
    
    // Cultural events related questions
    if (lowerPrompt.includes('dance') || lowerPrompt.includes('music') || 
        lowerPrompt.includes('cultural') || lowerPrompt.includes('dj') ||
        lowerPrompt.includes('performance') || lowerPrompt.includes('show')) {
      return {
        success: true,
        response: "💃 INNOVISION Cultural Events:\n\n" +
                 "🕺 Dance Competitions: Solo, Group, Battle formats\n" +
                 "🎵 Music Events: Singing, Band performances\n" +
                 "� DJ Nights: Electronic music and beats\n" +
                 "🎭 Drama & Theater: Acting competitions\n" +
                 "🎤 Open Mic: Poetry, Stand-up comedy\n" +
                 "👗 Fashion Shows: Ramp walk competitions\n\n" +
                 "Express your creativity and win amazing prizes! ✨",
        confidence: 1.0,
        category: 'cultural_events'
      };
    }
    
    // Date and schedule related questions
    if (lowerPrompt.includes('date') || lowerPrompt.includes('when') || 
        lowerPrompt.includes('schedule') || lowerPrompt.includes('time') ||
        lowerPrompt.includes('february') || lowerPrompt.includes('2025')) {
      return {
        success: true,
        response: "� INNOVISION 2025 Schedule:\n\n" +
                 "�️ Event Dates: February 21-23, 2025\n" +
                 "� Venue: NIT Rourkela Campus, Odisha\n" +
                 "⏰ Duration: 3 Days of non-stop celebration\n\n" +
                 "Day-wise Events:\n" +
                 "• Day 1: Opening ceremony, Tech talks, Hackathon begins\n" +
                 "• Day 2: Competitions, Cultural events, DJ Night\n" +
                 "• Day 3: Finals, Prize distribution, Closing ceremony\n\n" +
                 "Mark your calendars! 🎯",
        confidence: 1.0,
        category: 'schedule'
      };
    }
    
    // Food related questions
    if (lowerPrompt.includes('food') || lowerPrompt.includes('mess') || 
        lowerPrompt.includes('dining') || lowerPrompt.includes('meal') ||
        lowerPrompt.includes('eating') || lowerPrompt.includes('restaurant')) {
      return {
        success: true,
        response: "🍽️ INNOVISION Food Arrangements:\n\n" +
                 "🥘 Mess Facility: All meals included with accommodation\n" +
                 "🍕 Food Stalls: Variety of local and fast food\n" +
                 "☕ Cafeteria: Snacks, beverages, and refreshments\n" +
                 "🥗 Options: Vegetarian, Non-vegetarian, Vegan available\n" +
                 "🌶️ Local Cuisine: Authentic Odia delicacies\n" +
                 "💰 Affordable: Budget-friendly pricing\n\n" +
                 "Satisfy your taste buds while enjoying the fest! 🎉",
        confidence: 1.0,
        category: 'food'
      };
    }
    
    // Venue and location related questions
    if (lowerPrompt.includes('venue') || lowerPrompt.includes('location') || 
        lowerPrompt.includes('where') || lowerPrompt.includes('nit') ||
        lowerPrompt.includes('rourkela') || lowerPrompt.includes('odisha')) {
      return {
        success: true,
        response: "�️ INNOVISION Venue Details:\n\n" +
                 "📍 Location: NIT Rourkela Campus, Odisha\n" +
                 "� Campus: National Institute of Technology\n" +
                 "🌆 City: Rourkela, Steel City of India\n" +
                 "✈️ Nearest Airport: Rourkela Airport (15 km)\n" +
                 "� Railway: Rourkela Junction (10 km)\n" +
                 "🚌 Transport: Local buses and auto-rickshaws available\n\n" +
                 "Easy to reach with excellent connectivity! 🚀",
        confidence: 1.0,
        category: 'venue'
      };
    }
    
    // Default INNOVISION info for general questions
    if (lowerPrompt.includes('innovision') || lowerPrompt.includes('what is') || 
        lowerPrompt.includes('about') || lowerPrompt.includes('tell me') ||
        lowerPrompt.includes('info') || lowerPrompt.includes('details')) {
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
                 "Register now and be part of this amazing tech celebration! �",
        confidence: 1.0,
        category: 'innovision'
      };
    }
    
    // Default response for unmatched queries
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