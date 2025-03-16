// quizController.js
const { GoogleGenerativeAI } = require("@google/generative-ai");

// Gemini API Initialization
const API_KEY = process.env.GEMINI_API_KEY || 'AIzaSyAULeneZJyL7D6Jsy9WUNS3_auYnZU0BWM';
const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" }); // Using gemini-1.5-flash instead of 2.0

// Helper function to add delay between API calls
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Track previously asked questions to avoid repetition
const questionHistory = new Map();

// Generate initial question with 4 options
async function generateQuestion(topic, difficulty = 'medium', previousScore = null, questionId = 1, previousQuestions = []) {
  let difficultyPrompt = '';
  
  if (previousScore !== null) {
    if (previousScore >= 0.8) {
      difficultyPrompt = 'Make this question slightly harder than the previous one.';
    } else if (previousScore <= 0.4) {
      difficultyPrompt = 'Make this question slightly easier than the previous one.';
    } else {
      difficultyPrompt = 'Keep the difficulty similar to the previous question.';
    }
  }

  // Create a string of previously asked questions to avoid repetition
  const previousQuestionsText = previousQuestions.length > 0 
    ? `Previously asked questions that you MUST NOT repeat or closely paraphrase:\n${previousQuestions.join('\n')}` 
    : '';

  const prompt = `
    You are creating a unique multiple-choice question for an educational assessment on ${topic}.
    ${difficultyPrompt}
    
    The question should be at ${difficulty} difficulty level.
    
    IMPORTANT: Generate ONE challenging but fair question related to ${topic} that tests different knowledge than previous questions.
    
    DO NOT create questions about the same subtopic repeatedly.
    DO NOT focus exclusively on facts about Saturn-Roche or any single subtopic.
    ENSURE variety by exploring different aspects of ${topic}.
    Each question should cover a new concept, principle, or knowledge area.
    
    Here are a list of previous questions that you are NOT supposed to repeat at any costs : 
    ${previousQuestionsText}
    
    Format your response as JSON with the following structure:
    {
      "question": "The question text here",
      "explanation": "A brief explanation of the answer for educational purposes",
      "topic_area": "The specific subtopic this question addresses within ${topic}"
    }
    
    Do not include the answer or options in this response.
  `;

  try {
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
    });

    const responseText = result.response.text();
    
    // Extract JSON from response (handling potential text before/after JSON)
    try {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        console.log("Response didn't contain valid JSON:", responseText);
        // Fallback to a structured response
        return {
          question: `What are the key concepts in ${topic}?`,
          explanation: "This is a fallback question due to API parsing issues.",
          topic_area: "general concepts"
        };
      }
      
      const parsedResponse = JSON.parse(jsonMatch[0]);
      
      // Store question in history to avoid repetition
      const questionKey = `${topic}-${questionId}`;
      if (!questionHistory.has(questionKey)) {
        questionHistory.set(questionKey, []);
      }
      questionHistory.get(questionKey).push(parsedResponse.question);
      
      return parsedResponse;
    } catch (jsonError) {
      console.error("JSON parsing error:", jsonError, "Response was:", responseText);
      // Fallback to a structured response
      return {
        question: `What are the key concepts in ${topic}?`,
        explanation: "This is a fallback question due to API parsing issues.",
        topic_area: "general concepts"
      };
    }
  } catch (error) {
    console.error("Error generating question:", error);
    // Fallback to a structured response
    return {
      question: `What are the key concepts in ${topic}?`,
      explanation: "This is a fallback question due to API connection issues.",
      topic_area: "general concepts"
    };
  }
}

// Generate options for a given question
async function generateOptions(question, topic, topic_area) {
  const prompt = `
    For the following ${topic} question about "${topic_area}": 
    "${question}"
    
    Generate EXACTLY 4 multiple-choice options labeled A, B, C, and D.
    One option must be correct, and the other three should be plausible but incorrect.
    
    ENSURE all options are:
    - Distinct from each other
    - Relevant to the question
    - Clear and unambiguous
    - Approximately the same length and detail level
    - Written in a similar style
    
    Format your response as JSON with the following structure:
    {
      "options": {
        "A": "First option text",
        "B": "Second option text",
        "C": "Third option text",
        "D": "Fourth option text"
      },
      "correctAnswer": "The letter (A, B, C, or D) of the correct option"
    }
    
    Make sure the correct option is truly accurate and the incorrect options are plausible but clearly wrong to an expert.
  `;

  try {
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
    });

    const responseText = result.response.text();
    
    // Extract JSON from response with better error handling
    try {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        console.log("Options response didn't contain valid JSON:", responseText);
        // Fallback options
        return {
          options: {
            "A": `First concept in ${topic_area}`,
            "B": `Second concept in ${topic_area}`,
            "C": `Third concept in ${topic_area}`,
            "D": `Fourth concept in ${topic_area}`
          },
          correctAnswer: "A"
        };
      }
      
      return JSON.parse(jsonMatch[0]);
    } catch (jsonError) {
      console.error("JSON parsing error for options:", jsonError, "Response was:", responseText);
      // Fallback options
      return {
        options: {
          "A": `First concept in ${topic_area}`,
          "B": `Second concept in ${topic_area}`,
          "C": `Third concept in ${topic_area}`,
          "D": `Fourth concept in ${topic_area}`
        },
        correctAnswer: "A"
      };
    }
  } catch (error) {
    console.error("Error generating options:", error);
    // Fallback options
    return {
      options: {
        "A": `First concept in ${topic_area}`,
        "B": `Second concept in ${topic_area}`,
        "C": `Third concept in ${topic_area}`,
        "D": `Fourth concept in ${topic_area}`
      },
      correctAnswer: "A"
    };
  }
}

// Function to generate a single question with options
async function generateSingleQuestion(topic, difficulty, questionId, previousCorrect = null) {
  try {
    // Determine previous score (0-1 value)
    let previousScore = null;
    if (previousCorrect !== null) {
      previousScore = previousCorrect ? 1 : 0;
    }
    
    // Get previous questions for this topic to avoid repetition
    const topicKey = `${topic}-${questionId}`;
    const previousQuestions = questionHistory.has(topic) ? questionHistory.get(topic) : [];
    
    // Generate question
    const questionData = await generateQuestion(topic, difficulty, previousScore, questionId, previousQuestions);
    
    // Add delay between API calls to avoid rate limiting
    await delay(1000); // 1 second delay
    
    // Generate options
    const optionsData = await generateOptions(questionData.question, topic, questionData.topic_area || topic);
    
    // Combine and return
    return {
      id: questionId,
      question: questionData.question,
      options: [optionsData.options],
      answer: optionsData.correctAnswer,
      explanation: questionData.explanation || "Explanation not available",
      topic_area: questionData.topic_area || "general concepts"
    };
  } catch (error) {
    console.error(`Error generating question ${questionId}:`, error);
    
    // Return a fallback question
    return {
      id: questionId,
      question: `Fallback Question ${questionId}: What is an important concept in ${topic}?`,
      options: [{
        "A": "Concept 1",
        "B": "Concept 2",
        "C": "Concept 3",
        "D": "Concept 4"
      }],
      answer: "A",
      explanation: "This is a fallback question due to an error in question generation.",
      topic_area: "general concepts"
    };
  }
}

// Express route handler for generating a single question
async function generateNextQuestion(req, res) {
  try {
    console.log("Received next question request:", req.body);
    
    const { 
      topic, 
      currentQuestionId = 0, 
      totalQuestions = 10,
      lastAnswerCorrect = null, 
      difficulty = 'medium',
      previousTopicAreas = []
    } = req.body;
    
    if (!topic) {
      return res.status(400).json({ 
        error: "Topic is required",
        message: "Please provide a topic for the quiz question" 
      });
    }
    
    // Check if we've reached the end of the quiz
    if (currentQuestionId >= totalQuestions) {
      return res.json({ 
        completed: true,
        message: "Quiz completed. No more questions to generate." 
      });
    }
    
    console.log(`Generating question ${currentQuestionId + 1} for topic: ${topic}`);
    
    // Adjust difficulty based on previous answer
    let adjustedDifficulty = difficulty;
    if (lastAnswerCorrect === true) {
      // Make it harder if the last answer was correct
      adjustedDifficulty = 'hard';
    } else if (lastAnswerCorrect === false) {
      // Make it easier if the last answer was incorrect
      adjustedDifficulty = 'easy';
    }
    
    // Generate a single question with adjusted difficulty
    const question = await generateSingleQuestion(
      topic,
      adjustedDifficulty,
      currentQuestionId + 1,
      lastAnswerCorrect
    );
    
    // Return the question along with quiz metadata
    res.json({
      completed: false,
      currentQuestionId: currentQuestionId + 1,
      totalQuestions,
      remainingQuestions: totalQuestions - (currentQuestionId + 1),
      question
    });
    
  } catch (error) {
    console.error("Error generating next question:", error);
    res.status(500).json({ 
      error: "Failed to generate question", 
      message: error.message || "Unknown server error",
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}

// Keep the existing quiz generation function for backward compatibility
async function generateQuiz(req, res) {
  try {
    console.log("Received full quiz generation request:", req.body);
    
    const { topic, questionCount = 10, difficulty = 'medium' } = req.body;
    
    if (!topic) {
      return res.status(400).json({ 
        error: "Topic is required",
        message: "Please provide a topic for the quiz questions" 
      });
    }
    
    console.log(`Generating quiz with ${questionCount} questions on topic: ${topic}`);
    
    // Clear previous questions for this topic
    if (questionHistory.has(topic)) {
      questionHistory.delete(topic);
    }
    
    // Generate the specified number of questions with better error handling
    const questions = [];
    let currentDifficulty = difficulty;
    let lastScore = null;
    
    // Limit questionCount to reasonable bounds
    const actualQuestionCount = Math.min(Math.max(1, questionCount), 20);
    
    // Generate questions sequentially with error handling for each
    for (let i = 0; i < actualQuestionCount; i++) {
      console.log(`Generating question ${i + 1}/${actualQuestionCount}`);
      
      try {
        const questionData = await generateSingleQuestion(
          topic, 
          currentDifficulty, 
          i + 1, 
          lastScore
        );
        
        questions.push(questionData);
        
        // For simulation purposes, set a random score for adjustment
        // In real use, this would come from the user's previous answer
        lastScore = Math.random() > 0.5;
        
        // Adjust difficulty based on score
        if (lastScore) {
          currentDifficulty = 'hard';
        } else {
          currentDifficulty = 'easy';
        }
        
        // Add a significant delay between complete question generations
        await delay(2000); // 2 seconds delay between full question generations
      } catch (questionError) {
        console.error(`Error processing question ${i + 1}:`, questionError);
        // Add a fallback question instead of failing the entire request
        questions.push({
          id: i + 1,
          question: `Fallback Question ${i + 1}: What is an important concept in ${topic}?`,
          options: [{
            "A": "Concept 1",
            "B": "Second concept",
            "C": "Third concept",
            "D": "Fourth concept"
          }],
          answer: "A",
          explanation: "This is a fallback question due to an error in question generation.",
          topic_area: "general concepts"
        });
        
        // Still delay even after an error to avoid hitting rate limits
        await delay(2000);
      }
    }
    
    console.log(`Successfully generated ${questions.length} questions`);
    res.json({ questions });
  } catch (error) {
    console.error("Unhandled error in quiz generation:", error);
    res.status(500).json({ 
      error: "Failed to generate quiz", 
      message: error.message || "Unknown server error",
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}

// Add route for grading an answer
async function gradeAnswer(req, res) {
  try {
    const { userAnswer, correctAnswer, questionId } = req.body;
    
    if (!userAnswer || !correctAnswer) {
      return res.status(400).json({
        error: "Missing required parameters",
        message: "Both userAnswer and correctAnswer are required"
      });
    }
    
    // Simple direct comparison for grading
    const isCorrect = userAnswer === correctAnswer;
    const score = isCorrect ? 1 : 0;
    
    res.json({
      questionId,
      userAnswer,
      correctAnswer,
      isCorrect,
      score
    });
  } catch (error) {
    console.error("Error grading answer:", error);
    res.status(500).json({
      error: "Failed to grade answer",
      message: error.message || "Unknown server error"
    });
  }
}

// Add config options for API rate limiting
const quizConfig = {
  // Default timeouts that can be adjusted
  delays: {
    betweenApiCalls: process.env.DELAY_BETWEEN_API_CALLS || 1000, // 1 second
    betweenQuestions: process.env.DELAY_BETWEEN_QUESTIONS || 2000, // 2 seconds
  },
  // Maximum questions to generate in one request
  maxQuestionsPerRequest: process.env.MAX_QUESTIONS_PER_REQUEST || 20
};

module.exports = { 
  generateQuiz, 
  generateNextQuestion,
  gradeAnswer,
  quizConfig 
};