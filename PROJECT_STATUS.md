# InnoBot - INNOVISION AI Assistant 🤖

Your specialized AI assistant for INNOVISION, Eastern India's largest tech event!

## 🎯 **Successfully Updated Structure**

The chatbot has been completely restructured to match your provided format:

### **📁 Updated File Structure:**

```
innovision-bot/
├── 📁 config/
│   ├── botConfig.js          # Google AI configuration with safety settings
│   └── trainingData.js       # INNOVISION Q&A in export format
├── 📁 controllers/
│   └── chatBotHub.js         # Google Generative AI integration
├── 📁 libs/
│   ├── keywordExtractor.js   # Simple keyword extraction
│   ├── questionFilter.js     # Question filtering with keyword matching
│   ├── questionGenerator.js  # Parts generation for AI training
│   └── similarityMatcher.js  # Levenshtein distance similarity
├── 📁 middlewares/
│   ├── requestHandler.js     # CORS configuration
│   └── jsonHandler.js        # Express JSON parser
├── 📁 routes/
│   └── chatBotApi.js         # Single POST endpoint
├── index.js                  # ES6 Express server
├── package.json             # ES modules configuration
└── .env                     # Environment variables
```

### **🚀 Server Status:**
- ✅ **Running on port 5000**
- ✅ **ES6 modules enabled**
- ✅ **Google Generative AI integrated**
- ✅ **INNOVISION training data loaded**
- ✅ **CORS configured for all origins**

### **🔧 API Endpoint:**
```
POST http://localhost:5000/api/InnovisionBot
Content-Type: application/json

{
  "prompt": "What is INNOVISION?"
}
```

### **🎯 Key Features Implemented:**
1. **Google Generative AI** - Using Gemini 1.5 Flash model
2. **Safety Settings** - Content filtering for harassment, hate speech, etc.
3. **INNOVISION Focused** - Specialized training data about the tech event
4. **Keyword Matching** - Intelligent question filtering
5. **Similarity Matching** - Levenshtein distance algorithm
6. **ES6 Structure** - Modern JavaScript imports/exports
7. **Retry Logic** - Handles rate limiting with exponential backoff

### **⚙️ Environment Setup:**
Add your Google Gemini API key to `.env`:
```env
GEMINI_KEY=your_actual_gemini_api_key_here
```

**InnoBot is ready to assist with all INNOVISION queries!** 🌟