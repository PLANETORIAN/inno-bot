import chatBotController from './controllers/chatBotHub.js';

async function testExpandedKeywords() {
  console.log('🧪 Testing expanded keyword matching...\n');
  
  const testInputs = [
    // Registration keywords
    'how to participate in innovision',
    'entry fee for events',
    'payment methods accepted',
    
    // Accommodation keywords  
    'guest house booking',
    'hostel room availability',
    
    // Schedule keywords
    'november events',
    'time schedule',
    
    // Tech keywords
    'robotics competition', 
    'ai challenges',
    'web development contest',
    
    // Cultural keywords
    'singing competition',
    'band performance',
    
    // Food keywords
    'breakfast timing',
    'cafeteria location',
    
    // Location keywords
    'campus address',
    'how to reach nit rourkela',
    
    // Prizes keywords
    'winner rewards',
    'certificate distribution',
    
    // Transport keywords
    'bus facility',
    'nearest airport'
  ];
  
  for (const input of testInputs) {
    try {
      const result = await chatBotController.getTrainingDataResponse(input);
      console.log(`Input: "${input}"`);
      console.log(`Confidence: ${result.confidence.toFixed(2)}`);
      console.log(`Category: ${result.category}`);
      console.log(`Response: ${result.response.substring(0, 80)}...\n`);
    } catch (error) {
      console.log(`Error testing "${input}":`, error.message);
    }
  }
}

testExpandedKeywords();