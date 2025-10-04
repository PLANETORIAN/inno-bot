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

  // Process user input using training data and fallback to Google AI
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

      // First try to get response from training data
      const trainingResponse = await this.getTrainingDataResponse(prompt);
      if (trainingResponse.confidence > 0.7) {
        return trainingResponse;
      }

      // If no good match in training data, try Google AI as fallback
      try {
        const parts = generateQuestion(prompt);
        const model = this.genAI.getGenerativeModel({
          model: "gemini-2.5-flash"
        });
        
        const result = await model.generateContent({
          contents: [{ role: "user", parts: parts || [] }],
          safetySettings,
          generationConfig,
        });

        if (result && result.response) {
          const responseText = result.response.text();
          return {
            success: true,
            response: responseText,
            confidence: 1.0,
            category: 'ai_generated',
            matched_question: prompt
          };
        }
      } catch (aiError) {
        console.log('Google AI failed, using training data fallback:', aiError.message);
      }

      // If Google AI fails, return best training data match or default
      return trainingResponse.confidence > 0 ? trainingResponse : {
        success: true,
        response: this.getDefaultResponse(),
        confidence: 0.5,
        category: 'default'
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



  // Get response from training data using keyword matching
  async getTrainingDataResponse(prompt) {
    const lowerPrompt = prompt.toLowerCase();
    const { questionAnswers } = await import("../config/trainingData.js");
    
    let bestMatch = null;
    let highestScore = 0;
    
    // Check each training question for matches
    for (const qa of questionAnswers) {
      const questionLower = qa.question.toLowerCase();
      let score = 0;
      
      // Exact question match gets highest score
      if (questionLower === lowerPrompt) {
        score = 1.0;
      }
      // Partial question match
      else if (questionLower.includes(lowerPrompt) || lowerPrompt.includes(questionLower)) {
        score = 0.9;
      }
      // Keyword matching
      else {
        const promptWords = lowerPrompt.split(' ');
        const questionWords = questionLower.split(' ');
        let matchCount = 0;
        
        for (const word of promptWords) {
          if (word.length > 2 && questionWords.some(qw => qw.includes(word) || word.includes(qw))) {
            matchCount++;
          }
        }
        
        score = matchCount / Math.max(promptWords.length, 1);
        
        // Boost score for common keywords
        if (lowerPrompt.includes('innovision')) score += 0.3;
        if (lowerPrompt.includes('register') || lowerPrompt.includes('registration')) score += 0.2;
        if (lowerPrompt.includes('accommodation') || lowerPrompt.includes('stay')) score += 0.2;
        if (lowerPrompt.includes('date') || lowerPrompt.includes('when')) score += 0.2;
        if (lowerPrompt.includes('hackathon') || lowerPrompt.includes('coding')) score += 0.2;
        if (lowerPrompt.includes('cultural') || lowerPrompt.includes('dance')) score += 0.2;
        if (lowerPrompt.includes('food') || lowerPrompt.includes('mess')) score += 0.2;
      }
      
      if (score > highestScore) {
        highestScore = score;
        bestMatch = qa;
      }
    }
    
    if (bestMatch && highestScore > 0.3) {
      return {
        success: true,
        response: bestMatch.answer,
        confidence: highestScore,
        category: 'training_data',
        matched_question: bestMatch.question
      };
    }
    
    return {
      success: true,
      response: this.getDefaultResponse(),
      confidence: 0,
      category: 'default'
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
      ai_model: "Google Gemini 2.5 Flash",
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
    const userMessage = req.body.message || req.body.prompt;
    
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