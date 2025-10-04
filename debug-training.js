import chatBotController from './controllers/chatBotHub.js';

async function debugTrainingDataResponse() {
  const prompt = "what is innovision";
  console.log(`Testing: "${prompt}"\n`);
  
  const result = await chatBotController.getTrainingDataResponse(prompt);
  console.log('Training data result:', result);
}

debugTrainingDataResponse();