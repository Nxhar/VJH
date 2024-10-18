import { db } from '../../../_Firebase/firebaseConfig.js';
import { getDoc, doc, addDoc, collection } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { HashLoader } from 'react-spinners';
import { solarSystemQuiz, chemistryQuiz } from './assess.js'; // Import quiz data

function Assessment({ user }) {
  const { id } = useParams();
  const [courseData, setCourseData] = useState(null); // Use null initially for better checks
  const [selectedQuiz, setSelectedQuiz] = useState([]); // Use an array for selected quiz
  const [answers, setAnswers] = useState({}); // Store answers for each question
  const [isSubmitting, setIsSubmitting] = useState(false); // Track submission state
  const navigate = useNavigate();
  // Function to handle answer changes
  const handleAnswerChange = (questionId, answer) => {
    setAnswers((prevAnswers) => ({ ...prevAnswers, [questionId]: answer }));
  };

  // Function to fetch course data from Firestore
  const fetchData = async () => {
    try {
      const docRef = doc(db, 'courses', id);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        setCourseData(docSnap.data());
      } else {
        console.error('Page not found');
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  // Function to submit the assessment
  const submitAssessment = async () => {
    setIsSubmitting(true); // Show loading indicator

    try {
      const gradedAnswers = {}; // Store graded answers

      // Call the grading function (replace with your actual grading logic)
      for (const question of selectedQuiz) {
        gradedAnswers[question.id] = await gradeAnswer(answers[question.id], question.answer); // Grading logic
      }

      // Calculate total score and average
      const totalScore = Object.values(gradedAnswers).reduce((acc, cur) => acc + cur, 0);
      const averageScore = totalScore / Object.keys(gradedAnswers).length;

      const newdata = {
        displayName: user.displayName,
        uid: user.uid,
        cid: id,
        course_name: courseData.name,
        scores: gradedAnswers,
        totalScore,
        averageScore,
      };

      // Save results to Firestore
      const docRef = await addDoc(collection(db, 'course_results'), newdata);
      console.log('Document written with ID: ', docRef.id);

      // Handle successful submission
      alert('Assessment submitted successfully!');

      navigate('/results', { state: { newdata } });

    } catch (err) {
      console.error(err);
      alert('An error occurred while submitting the assessment. Please try again later.');
    } finally {
      setIsSubmitting(false); // Hide loading indicator
    }
  };

  // Function to grade an answer
  const gradeAnswer = async (answer, correctAnswer) => {
    // Simple grading logic
    return answer === correctAnswer ? 1 : 0; // 1 point for correct, 0 for incorrect
  };

  useEffect(() => {
    fetchData();
  }, [id]); // Fetch data whenever the ID changes

  useEffect(() => {
    if (courseData && courseData.name) {
      const quizMapping = {
        'Solar System and its Wonders': solarSystemQuiz['Solar System'],
        'Chemistry Simplified': chemistryQuiz['Chemistry'],
      };
      setSelectedQuiz(quizMapping[courseData.name] || []); // Default to empty array if not found
    }
  }, [courseData]); // Select quiz based on course name

  return (
    <div className='coursesContainer'>
      <h2>Assessment Time!</h2>
      {courseData ? (
        <>
          <h3>{courseData.name}</h3>
          {selectedQuiz.length > 0 ? (
            <>
              {selectedQuiz.map((question) => (
                <div key={question.id} className='questionContainer'>
                  <div className='questionText'>{question.id}. {question.question}</div>
                  <div className='options'>
                    {Object.entries(question.options[0]).map(([key, option]) => (
                      <>
                      <label key={key} className='option'>
                        <input
                          type="radio"
                          name={`question_${question.id}`}
                          value={option}
                          checked={answers[question.id] === option}
                          onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                        />
                        {option}
                      </label>
                        <br /> <br/>
                      </>
                      
                    ))}
                  </div>
                </div>
              ))}
              <div className='fetchScore' onClick={submitAssessment}>
                {isSubmitting ? <HashLoader /> : 'Submit'}
              </div>
            </>
          ) : (
            <p>No questions found for this course.</p>
          )}
        </>
      ) : (
        <HashLoader />
      )}
    </div>
  );
}

export default Assessment;
