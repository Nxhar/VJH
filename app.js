// app.js (or server.js)
const express = require('express');
const { GoogleGenerativeAI } = require("@google/generative-ai");
const { generateQuiz, generateNextQuestion, gradeAnswer, quizConfig } = require('./quizController');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 5000;

// Enable more detailed logging for debugging
const loggerMiddleware = (req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  
  // Log request body for POST requests
  if (req.method === 'POST') {
    console.log('Request body:', req.body);
  }
  
  // Capture response
  const oldSend = res.send;
  res.send = function(data) {
    console.log(`Response status: ${res.statusCode}`);
    // Don't log potentially large response data
    return oldSend.apply(res, arguments);
  };
  
  next();
};

// Apply middleware
app.use(cors());
app.use(express.json());
app.use(loggerMiddleware);

// Add error handling middleware
app.use((err, req, res, next) => {
  console.error('Express error middleware caught:', err);
  res.status(500).json({
    error: "Server error",
    message: err.message || "An unexpected error occurred",
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

// Original Gemini endpoint with improved error handling
app.post('/api/gemini', async (req, res) => {
  try {
    if (!req.body || !req.body.prompt) {
      return res.status(400).json({ error: "Missing prompt in request body" });
    }
    
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'AIzaSyAULeneZJyL7D6Jsy9WUNS3_auYnZU0BWM');
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" }); // Updated model

    const { prompt } = req.body;

    console.log("Sending prompt to Gemini API:", prompt.substring(0, 100) + '...');
    
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
    });

    if (!result || !result.response) {
      return res.status(500).json({ error: "No response from Gemini API" });
    }

    const responseText = result.response.text();
    res.json({ response: responseText });
  } catch (error) {
    console.error("Gemini API Error:", error);
    
    let statusCode = 500;
    if (error.message && error.message.includes('429')) {
      statusCode = 429; // Too Many Requests
    }
    
    res.status(statusCode).json({ 
      error: error.message || 'Error communicating with Gemini API',
      detail: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Complete quiz generation endpoint (generates all questions at once)
app.post('/api/generate-quiz', async (req, res, next) => {
  try {
    await generateQuiz(req, res);
  } catch (error) {
    next(error); // Pass to the error handling middleware
  }
});

// Next question generation endpoint (generates questions one by one)
app.post('/api/next-question', async (req, res, next) => {
  try {
    await generateNextQuestion(req, res);
  } catch (error) {
    next(error); // Pass to the error handling middleware
  }
});

// Answer grading endpoint
app.post('/api/grade-answer', async (req, res, next) => {
  try {
    await gradeAnswer(req, res);
  } catch (error) {
    next(error); // Pass to the error handling middleware
  }
});

// Quiz configuration endpoint
app.get('/api/quiz-config', (req, res) => {
  res.json({ 
    config: {
      maxQuestionsPerRequest: quizConfig.maxQuestionsPerRequest,
      delays: quizConfig.delays
    }
  });
});

// Simple health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    version: process.env.APP_VERSION || '1.0.0'
  });
});

// Start server
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
  console.log(`Health check available at http://localhost:${port}/api/health`);
  console.log(`Quiz generation available at http://localhost:${port}/api/generate-quiz`);
  console.log(`Next question available at http://localhost:${port}/api/next-question`);
});