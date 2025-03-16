import { db } from '../../../_Firebase/firebaseConfig.js';
import { getDoc, doc, addDoc, collection } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { HashLoader } from 'react-spinners';
import axios from 'axios';

function Assessment({ user }) {
  const { id } = useParams();
  const [courseData, setCourseData] = useState(null);
  const [quizQuestions, setQuizQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [answers, setAnswers] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingError, setLoadingError] = useState(null);
  const [questionCount, setQuestionCount] = useState(10);
  const [scores, setScores] = useState({});
  const [retryCount, setRetryCount] = useState(0);
  const [quizProgress, setQuizProgress] = useState({
    currentQuestionId: 0,
    totalQuestions: 10,
    completed: false
  });
  const navigate = useNavigate();

  // API Configuration
  const API_BASE_URL = 'http://localhost:5000'; // Change this for production

  // Function to handle answer changes
  const handleAnswerChange = (questionId, answer) => {
    setAnswers((prevAnswers) => ({ ...prevAnswers, [questionId]: answer }));
  };

  // Function to fetch course data from Firestore
  const fetchCourseData = async () => {
    try {
      const docRef = doc(db, 'courses', id);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        setCourseData(data);
        return data;
      } else {
        const error = 'Course not found';
        console.error(error);
        setLoadingError(error);
        return null;
      }
    } catch (error) {
      console.error('Error fetching course data:', error);
      setLoadingError(`Error fetching course: ${error.message}`);
      return null;
    }
  };
  
  // Function to generate the first question
  const generateFirstQuestion = async (courseName) => {
    try {
      setIsLoading(true);
      setLoadingError(null);
      
      console.log(`Generating first question for ${courseName}`);
      
      // First check if API is available
      try {
        await axios.get(`${API_BASE_URL}/api/health`, { timeout: 5000 });
      } catch (healthError) {
        console.error('API health check failed:', healthError);
        throw new Error('Quiz server is not available. Please try again later.');
      }
      
      const response = await axios.post(`${API_BASE_URL}/api/next-question`, {
        topic: courseName,
        currentQuestionId: 0,
        totalQuestions: questionCount,
        difficulty: 'medium'
      }, {
        timeout: 15000, // 15 second timeout
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (response.data && response.data.question) {
        console.log('Successfully loaded first question:', response.data);
        
        // Set the current question
        setCurrentQuestion(response.data.question);
        
        // Add to questions array to keep history
        setQuizQuestions([response.data.question]);
        
        // Update progress
        setQuizProgress({
          currentQuestionId: response.data.currentQuestionId,
          totalQuestions: response.data.totalQuestions,
          completed: response.data.completed
        });
      } else {
        console.error('Invalid response format from question generation API:', response.data);
        throw new Error('Failed to generate valid quiz question. Please try again.');
      }
    } catch (error) {
      console.error('Error generating first question:', error);
      
      // Handle different error types
      if (error.response) {
        // Server responded with error status
        console.error('Server error response:', error.response.data);
        setLoadingError(`Server error: ${error.response.data.message || error.response.statusText || error.message}`);
      } else if (error.request) {
        // Request made but no response received
        setLoadingError('No response from quiz server. Please check your connection and try again.');
      } else {
        // Other errors
        setLoadingError(`Error: ${error.message}`);
      }
      
      // Set fallback question if we've retried too many times
      if (retryCount >= 2) {
        console.log('Providing fallback question after multiple retries');
        const fallbackQuestion = generateFallbackQuestion(courseName, 1);
        setCurrentQuestion(fallbackQuestion);
        setQuizQuestions([fallbackQuestion]);
        setQuizProgress({
          currentQuestionId: 1,
          totalQuestions: questionCount,
          completed: false
        });
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  // Function to generate the next question based on previous answer
  const generateNextQuestion = async (isCorrect) => {
    try {
      setIsLoading(true);
      setLoadingError(null);
      
      if (quizProgress.completed) {
        console.log('Quiz is already completed');
        return;
      }
      
      console.log(`Generating next question with previous answer correct: ${isCorrect}`);
      
      const response = await axios.post(`${API_BASE_URL}/api/next-question`, {
        topic: courseData.name,
        currentQuestionId: quizProgress.currentQuestionId,
        totalQuestions: questionCount,
        lastAnswerCorrect: isCorrect,
        difficulty: isCorrect ? 'hard' : 'easy'
      }, {
        timeout: 15000, // 15 second timeout
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (response.data && response.data.question) {
        console.log('Successfully loaded next question:', response.data);
        
        // Set the current question
        setCurrentQuestion(response.data.question);
        
        // Add to questions array to keep history
        setQuizQuestions(prev => [...prev, response.data.question]);
        
        // Update progress
        setQuizProgress({
          currentQuestionId: response.data.currentQuestionId,
          totalQuestions: response.data.totalQuestions,
          completed: response.data.completed
        });
      } else if (response.data && response.data.completed) {
        console.log('Quiz completed:', response.data);
        setQuizProgress({
          ...quizProgress,
          completed: true
        });
      } else {
        console.error('Invalid response format from question generation API:', response.data);
        throw new Error('Failed to generate valid quiz question. Please try again.');
      }
    } catch (error) {
      console.error('Error generating next question:', error);
      
      // Handle different error types
      if (error.response) {
        // Server responded with error status
        console.error('Server error response:', error.response.data);
        setLoadingError(`Server error: ${error.response.data.message || error.response.statusText || error.message}`);
      } else if (error.request) {
        // Request made but no response received
        setLoadingError('No response from quiz server. Please check your connection and try again.');
      } else {
        // Other errors
        setLoadingError(`Error: ${error.message}`);
      }
      
      // Set fallback question
      const fallbackQuestion = generateFallbackQuestion(courseData.name, quizProgress.currentQuestionId + 1);
      setCurrentQuestion(fallbackQuestion);
      setQuizQuestions(prev => [...prev, fallbackQuestion]);
      setQuizProgress(prev => ({
        ...prev,
        currentQuestionId: prev.currentQuestionId + 1,
        completed: prev.currentQuestionId + 1 >= prev.totalQuestions
      }));
    } finally {
      setIsLoading(false);
    }
  };
  
  // Generate a single fallback question if API fails
  const generateFallbackQuestion = (topic, questionId) => {
    return {
      id: questionId,
      question: `Question ${questionId}: What is an important concept in ${topic}?`,
      options: [{
        "A": `${topic} concept 1`,
        "B": `${topic} concept 2`,
        "C": `${topic} concept 3`,
        "D": `${topic} concept 4`
      }],
      answer: "A",
      explanation: "This is a fallback question. The API-generated questions are currently unavailable."
    };
  };

  // Retry quiz generation
  const retryQuizGeneration = () => {
    setRetryCount(prevCount => prevCount + 1);
    if (courseData && courseData.name) {
      generateFirstQuestion(courseData.name);
    }
  };

  // Function to submit the current question answer and fetch the next question
  const submitCurrentAnswer = async () => {
    if (!currentQuestion || !answers[currentQuestion.id]) {
      alert('Please select an answer before continuing.');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Grade the current answer
      const userAnswer = answers[currentQuestion.id];
      const correctAnswer = currentQuestion.answer;
      const isCorrect = userAnswer === correctAnswer;
      
      // Store the score
      setScores(prev => ({...prev, [currentQuestion.id]: isCorrect ? 1 : 0}));
      
      // If quiz is not complete, get the next question
      if (!quizProgress.completed && quizProgress.currentQuestionId < quizProgress.totalQuestions) {
        await generateNextQuestion(isCorrect);
      } else {
        // Mark as complete if we've reached the end
        setQuizProgress(prev => ({...prev, completed: true}));
      }
    } catch (error) {
      console.error('Error submitting answer:', error);
      alert('An error occurred while submitting your answer. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Function to submit the entire assessment
  // Function to submit the entire assessment
const submitAssessment = async () => {
  setIsSubmitting(true);

  try {
    // Calculate total score and average
    const answeredQuestions = Object.keys(scores).length;
    const totalScore = Object.values(scores).reduce((acc, cur) => acc + cur, 0);
    const averageScore = answeredQuestions > 0 ? totalScore / answeredQuestions : 0;
    const percentageComplete = (answeredQuestions / quizProgress.totalQuestions) * 100;

    const newdata = {
      displayName: user.displayName,
      uid: user.uid,
      cid: id,
      course_name: courseData?.name || 'Unknown Course',
      scores: scores,
      totalQuestions: quizProgress.totalQuestions,
      answeredQuestions,
      totalScore,
      averageScore,
      percentageComplete,
      submittedAt: new Date(),
      questions: quizQuestions.map(q => ({
        id: q.id,
        question: q.question,
        options: q.options, // Include the options
        correctAnswer: q.answer,
        userAnswer: answers[q.id] || null,
        explanation: q.explanation || ""
      }))
    };

    // Save results to Firestore
    const docRef = await addDoc(collection(db, 'course_results'), newdata);
    console.log('Document written with ID: ', docRef.id);

    // Handle successful submission
    alert('Assessment submitted successfully!');

    navigate('/results', { state: { newdata } });
  } catch (err) {
    console.error('Error submitting assessment:', err);
    alert('An error occurred while submitting the assessment. Please try again later.');
  } finally {
    setIsSubmitting(false);
  }
};

  useEffect(() => {
    const initializeAssessment = async () => {
      const course = await fetchCourseData();
      if (course && course.name) {
        await generateFirstQuestion(course.name);
      }
    };
    
    initializeAssessment();
  }, [id]); // Re-fetch when ID changes

  // Effect to handle question count changes
  useEffect(() => {
    // Only regenerate questions if we already have course data and the user hasn't started answering
    if (courseData && courseData.name && Object.keys(answers).length === 0) {
      generateFirstQuestion(courseData.name);
    }
  }, [questionCount]);

  // Calculate completion percentage
  const answeredCount = Object.keys(answers).length;
  const completionPercentage = quizProgress.totalQuestions > 0 
    ? Math.round((answeredCount / quizProgress.totalQuestions) * 100) 
    : 0;

  return (
    <div className='coursesContainer'>
      <h2>Assessment Time!</h2>
      
      {courseData && (
        <h3>{courseData.name}</h3>
      )}
      
      {isLoading ? (
        <div className="loading-container">
          <HashLoader />
          <p>{quizQuestions.length === 0 ? "Generating your first question..." : "Loading next question..."}</p>
        </div>
      ) : loadingError ? (
        <div className="error-container">
          <h4>Error Loading Questions</h4>
          <p>{loadingError}</p>
          <button 
            className="retry-button"
            onClick={retryQuizGeneration}
          >
            Retry
          </button>
        </div>
      ) : currentQuestion ? (
        <div className="assessment-container">
          <div className="progress-bar">
            <div className="progress-text">
              Question {quizProgress.currentQuestionId} of {quizProgress.totalQuestions} ({completionPercentage}% answered)
            </div>
            <div className="progress-indicator">
              <div 
                className="progress-filled" 
                style={{ width: `${(quizProgress.currentQuestionId / quizProgress.totalQuestions) * 100}%` }}
              ></div>
            </div>
          </div>
          
          <div className="question-container">
            <div className="question-text">
              <strong>Question {currentQuestion.id}:</strong> {currentQuestion.question}
            </div>
            
            <div className="options-container">
              {Object.entries(currentQuestion.options[0]).map(([key, option]) => (
                <div key={key} className="option">
                  <label className="option-label">
                    <input
                      type="radio"
                      name={`question_${currentQuestion.id}`}
                      value={key}
                      checked={answers[currentQuestion.id] === key}
                      onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                    />
                    <span className="option-text">
                      <strong>{key}:</strong> {option}
                    </span>
                  </label>
                </div>
              ))}
            </div>
          </div>
          
          <div className="navigation-buttons">
            {!quizProgress.completed ? (
              <button 
                className="nav-button next-button"
                onClick={submitCurrentAnswer}
                disabled={isSubmitting || !answers[currentQuestion.id]}
              >
                {isSubmitting ? <HashLoader size={20} /> : 'Submit Answer & Continue'}
              </button>
            ) : (
              <button 
                className="nav-button submit-button"
                onClick={submitAssessment}
                disabled={isSubmitting}
              >
                {isSubmitting ? <HashLoader size={20} /> : 'Complete Assessment'}
              </button>
            )}
          </div>
          
          <div className="question-dots">
            {Array.from({length: quizProgress.totalQuestions}, (_, i) => (
              <span 
                key={i} 
                className={`dot ${i + 1 === quizProgress.currentQuestionId ? 'active' : ''} ${i + 1 <= quizProgress.currentQuestionId ? 'answered' : ''}`}
                title={`Question ${i + 1}${i + 1 <= quizProgress.currentQuestionId ? ' (Answered)' : ''}`}
              />
            ))}
          </div>
        </div>
      ) : (
        <p>No questions could be generated for this course. Please try again later.</p>
      )}
      
      {!isLoading && !loadingError && quizQuestions.length === 0 && (
        <div className="question-count-control">
          <label htmlFor="questionCount">Number of Questions:</label>
          <select 
            id="questionCount" 
            value={questionCount} 
            onChange={(e) => setQuestionCount(parseInt(e.target.value))}
          >
            <option value="5">5</option>
            <option value="10">10</option>
            <option value="15">15</option>
            <option value="20">20</option>
          </select>
        </div>
      )}
    </div>
  );
}

export default Assessment;