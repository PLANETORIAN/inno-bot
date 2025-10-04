import { questionAnswers } from "../config/trainingData.js";

export default function generateQuestion(question) {
    let completeParts = [];
    
    // Use all training data for context
    const dataArray = questionAnswers;

    for (let i = 0; i < dataArray.length; i++) {
        completeParts.push({
            text: `input: ${dataArray[i].question}`,
        });
        completeParts.push({
            text: `output: ${dataArray[i].answer}`,
        });
    }
    completeParts.push({
        text: `input: ${question}`,
    });
    return completeParts;
}

