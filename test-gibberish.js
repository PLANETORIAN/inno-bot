import chatBotController from './controllers/chatBotHub.js';

async function testGibbershDetection() {
  console.log('🧪 Testing gibberish detection...\n');
  
  const testInputs = [
    'jsdjksd',
    'what is innovision',
    'hello',
    'aaaaaa',
    'qwerty',
    'tell me about hackathon',
    'xyz',
    'accommodation info'
  ];
  
  for (const input of testInputs) {
    try {
      const result = await chatBotController.processMessage(input);
      console.log(`Input: "${input}"`);
      console.log(`Response: ${result.response.substring(0, 100)}...`);
      console.log(`Category: ${result.category}, Confidence: ${result.confidence}\n`);
    } catch (error) {
      console.log(`Error testing "${input}":`, error.message);
    }
  }
}

testGibbershDetection();