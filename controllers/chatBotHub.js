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
      
      // For gibberish/random input, always use default response
      if (prompt.length < 3 || /^[bcdfghjklmnpqrstvwxyz]{5,}$/i.test(prompt.replace(/\s/g, ''))) {
        return {
          success: true,
          response: this.getDefaultResponse(),
          confidence: 0.5,
          category: 'default'
        };
      }
      
      // Use training data for any reasonable match
      if (trainingResponse.confidence > 0.3) {
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
        
        // Apply keyword-based scoring boosts
        score += this.calculateKeywordBoost(lowerPrompt);
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

  // Keyword mapping for better matching scores
  getKeywordMap() {
    return {
      // High priority keywords
      'innovision': 0.4,
      'what is innovision': 0.5,
      
      // Registration & Participation keywords
      'registration': {
        keywords: ['register', 'registration', 'participate', 'join', 'entry', 'fee', 'cost', 'payment', 'enroll', 'signup'],
        boost: 0.3
      },
      
      // Accommodation & Stay keywords  
      'accommodation': {
        keywords: ['accommodation', 'stay', 'hostel', 'room', 'lodge', 'guest house', 'dormitory', 'booking'],
        boost: 0.3
      },
      
      // Dates & Schedule keywords
      'schedule': {
        keywords: ['date', 'when', 'schedule', 'time', 'november', '2025', 'timing', 'calendar', 'agenda'],
        boost: 0.3
      },
      
      // Tech Events & Competitions keywords
      'tech_events': {
        keywords: ['hackathon', 'coding', 'programming', 'contest', 'competition', 'tech', 'robotics', 'ai', 'machine learning', 'web dev', 'software', 'algorithm'],
        boost: 0.3
      },
      
      // Cultural Events keywords
      'cultural': {
        keywords: ['cultural', 'dance', 'music', 'dj', 'performance', 'show', 'singing', 'band', 'concert', 'stage'],
        boost: 0.3
      },
      
      // Food & Dining keywords
      'food': {
        keywords: ['food', 'mess', 'dining', 'meal', 'breakfast', 'lunch', 'dinner', 'cafeteria', 'restaurant', 'snacks'],
        boost: 0.3
      },
      
      // Location & Venue keywords
      'location': {
        keywords: ['venue', 'location', 'where', 'nit', 'rourkela', 'odisha', 'campus', 'address', 'place', 'auditorium'],
        boost: 0.3
      },
      
      // Prizes & Rewards keywords
      'prizes': {
        keywords: ['prize', 'reward', 'winner', 'award', 'certificate', 'trophy', 'cash', 'medal', 'recognition'],
        boost: 0.3
      },
      
      // Transport & Travel keywords
      'transport': {
        keywords: ['transport', 'travel', 'bus', 'train', 'flight', 'airport', 'railway', 'reach', 'directions', 'commute'],
        boost: 0.3
      },
      
      // Contact & Information keywords
      'contact': {
        keywords: ['contact', 'phone', 'email', 'website', 'coordinator', 'organizer', 'help', 'support'],
        boost: 0.3
      },
      
      // Rules & Guidelines keywords
      'rules': {
        keywords: ['rules', 'regulations', 'guidelines', 'eligibility', 'requirements', 'criteria', 'conditions'],
        boost: 0.3
      },


      

      'game-to-aim': {
    keywords: [
      'game to aim', 'gaming showcase', 'competition', 'war of machine', 'gta', 'rulebook'
    ],
    boost: 0.3
  },
  'astronitr': {
    keywords: [
      'astronitr', 'stellar night', 'astronomy', 'space', 'club', 'rulebook'
    ],
    boost: 0.3
  },
  'grapevine': {
    keywords: [
      'grapevine', 'business club', 'business mystery', 'the missing ceo', 'weird bazar', 'marketplace challenge', 'rulebook'
    ],
    boost: 0.3
  },
  'foodtech': {
    keywords: [
      'food tech', 'food saga', 'roadies', 'trivia', 'taste test', 'club', 'rulebook'
    ],
    boost: 0.3
  },
  'matrix': {
    keywords: [
      'matrix', 'matrix club', 'photography', 'snapstrix', 'matrix mystery mania', 'puzzle', 'rulebook'
    ],
    boost: 0.3
  },
  'axiom': {
    keywords: [
      'axiom', 'omega', 'psi-phi', 'treasure hunt', 'hackathon', 'business', 'rulebook'
    ],
    boost: 0.3
  },
  'steellun': {
    keywords: [
      'steellun', 'alloy auction', 'materials', 'engineering challenge', 'rulebook'
    ],
    boost: 0.3
  },
  'asme': {
    keywords: [
      'asme', 'velocity vortex', 'hydronaut', 'vehicle race', 'submarine', 'club', 'rulebook'
    ],
    boost: 0.3
  },
  'genesys': {
    keywords: [
      'genesys', 'bioengineering', 'pitchdeck', 'bioventure', 'maze hunt', 'club', 'rulebook'
    ],
    boost: 0.3
  },
  'ml4e': {
    keywords: [
      'ml4e', 'ai image generation', 'ai image', 'image challenge', 'prompt abyss', 'prompt', 'rulebook'
    ],
    boost: 0.3
  },
  'design-tab': {
    keywords: [
      'design tab', 'design dash', 'creative challenge', 'doodle', 'rulebook'
    ],
    boost: 0.3
  },
  'aps': {
    keywords: [
      'algorithmic and programming society', 'aps', 'sunken cipher', 'crypto puzzle', 'underwater puzzle', 'rulebook'
    ],
    boost: 0.3
  },
  'cognizen': {
    keywords: [
      'cognizen', 'intelligent trader', 'chaupaal', 'market simulation', 'debate', 'rulebook'
    ],
    boost: 0.3
  },
  'akriti': {
    keywords: [
      'akriti', 'radiance', 'art show', 'design contest', 'club', 'rulebook'
    ],
    boost: 0.3
  },
  'printstation': {
    keywords: [
      'printstation', 'escape room', 'puzzle', 'club', 'rulebook'
    ],
    boost: 0.3
  },
  'analytics-consulting': {
    keywords: [
      'analytics and consulting', 'case matrix', 'case study', 'consulting', 'club', 'rulebook'
    ],
    boost: 0.3
  },
  'opencode': {
    keywords: [
      'opencode', 'openchase', 'coding', 'programming', 'challenge', 'club', 'rulebook'
    ],
    boost: 0.3
  },
  'cest': {
    keywords: [
      'cest', 'shake it off', 'frame it out', 'earthquake', 'photography', 'civil engineering', 'rulebook'
    ],
    boost: 0.3
  },
  'inquizzitive': {
    keywords: [
      'inquizzitive', 'sci-biz-tech quiz', 'quiz', 'science', 'business', 'club', 'rulebook'
    ],
    boost: 0.3
  },
  'incers': {
    keywords: [
      'incers', 'ceramarin quiz', 'materials', 'ceramics', 'science', 'club', 'rulebook'
    ],
    boost: 0.3
  },
  '3d-club': {
    keywords: [
      '3d data design and development', 'vibe with 3d', 'model mania', '3d modeling', 'club', 'rulebook'
    ],
    boost: 0.3
  },
  'ecell': {
    keywords: [
      'e-cell', 'ipl auction', 'auction', 'business', 'club', 'rulebook'
    ],
    boost: 0.3
  },
  'udaan': {
    keywords: [
      'udaan', 'aeroprix', 'hovermania', 'aeromodelling', 'hovercraft', 'club', 'rulebook'
    ],
    boost: 0.3
  },
  'short-circuit': {
    keywords: [
      'short circuit', 'spark-a-thon', 'hackathon', 'water monitoring', 'arduino', 'club', 'rulebook'
    ],
    boost: 0.3
  },
  'sae': {
    keywords: [
      'society of automotive engineers', 'virtual racing simulator', 'ignition grand prix', 'car show', 'automotive', 'club', 'rulebook'
    ],
    boost: 0.3
  },
  'parikramaka': {
    keywords: [
      'parikramaka', 'satquest', 'satellite', 'space', 'challenge', 'club', 'rulebook'
    ],
    boost: 0.3
  }
    };
  }

  // Calculate keyword boost score
  calculateKeywordBoost(prompt) {
    const keywordMap = this.getKeywordMap();
    let totalBoost = 0;
    
    // Check for direct keyword matches first
    if (prompt.includes('innovision')) totalBoost += keywordMap['innovision'];
    if (prompt.includes('what is') && prompt.includes('innovision')) totalBoost += keywordMap['what is innovision'];
    
    // Check category-based keywords
    for (const [category, config] of Object.entries(keywordMap)) {
      if (typeof config === 'object' && config.keywords) {
        const hasKeyword = config.keywords.some(keyword => prompt.includes(keyword));
        if (hasKeyword) {
          totalBoost += config.boost;
        }
      }
    }
    
    return totalBoost;
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