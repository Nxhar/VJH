import { useLocation } from 'react-router-dom';
import { useState } from 'react';
import CheckIcon from '@mui/icons-material/Check';
import ClearIcon from '@mui/icons-material/Clear';
import Modal from '@mui/material/Modal';
import Box from '@mui/material/Box';

function Results() {
  const { state } = useLocation();
  const { newdata } = state || {};
  const [open, setOpen] = useState(false);

  if (!newdata) {
    return <p>No results found. Please complete an assessment first.</p>;
  }

  const { averageScore, questions } = newdata;
  let learnerCategory;

  if (averageScore >= 0.8) {
    learnerCategory = 'Fast Learner';
  } else if (averageScore >= 0.5) {
    learnerCategory = 'Average Learner';
  } else {
    learnerCategory = 'Slow Learner';
  }

  // Recommended videos based on learner category
  const recommendedVideos = {
    'Fast Learner': [
      { title: 'Advanced Concepts in ' + newdata.course_name, url: 'https://www.youtube.com/embed/kBs2-J6k8vM' },
      { title: 'Exploring Beyond Basic ' + newdata.course_name, url: 'https://www.youtube.com/embed/zeaFHgsDs1I' },
    ],
    'Average Learner': [
      { title: 'Intermediate Guide to ' + newdata.course_name, url: 'https://www.youtube.com/embed/libKVRa01L8' },
      { title: newdata.course_name + ' Basics Reinforced', url: 'https://www.youtube.com/embed/x1QTc5YeO6w' },
    ],
    'Slow Learner': [
      { title: 'Introduction to ' + newdata.course_name, url: 'https://www.youtube.com/embed/yaPhKc31zPs' },
      { title: 'Beginner\'s Guide to ' + newdata.course_name, url: 'https://www.youtube.com/embed/lcZTcfdZ3Ow' },
    ],
  };

  // Modal open/close handlers
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  return (
    <div className='resultsContainer'>
      <h2>Assessment Results</h2>
      <p>Name: {newdata.displayName}</p>
      <p>Course: {newdata.course_name}</p>
      <p>Total Score: {newdata.totalScore}</p>
      <p>Average Score: {averageScore.toFixed(2)}</p>
      <p>Category: {learnerCategory}</p>
      <p>Questions Answered: {newdata.answeredQuestions} of {newdata.totalQuestions}</p>

      <div className="center">
        <button onClick={handleOpen} className='recButton' style={{ fontSize: '18px' }}>
          Based on your results, here are some recommendations to improve yourself!
        </button>
      </div>

      <Modal open={open} onClose={handleClose} aria-labelledby='recommended-videos-modal'>
        <Box style={{ width: '90vw' }}
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 600,
            bgcolor: 'background.paper',
            border: '2px solid #000',
            boxShadow: 24,
            p: 4,
          }}
        >
          <h3 id='recommended-videos-modal' style={{ textAlign: 'center', marginBottom:'20px' }} >Recommended Videos for Improvement</h3>
          <div className="center" >
            {recommendedVideos[learnerCategory].map((video, index) => (
              <div key={index} className='videoRecommendation'>

                <iframe
                  width='600'
                  height='315'
                  src={video.url}
                  title={video.title}
                  frameBorder='0'
                  allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture'
                  allowFullScreen
                ></iframe>

                <p style={{fontWeight:'bold', textAlign:'center'}}>{video.title}</p>
              </div>
            ))}
          </div>
          <div className="center">
            <button className='recButton' onClick={handleClose} >
              Close
            </button>
          </div>
        </Box>
      </Modal>

      <h3>Question Results</h3>
      {newdata.questions && newdata.questions.map((questionData) => {
        const userAnswer = questionData.userAnswer;
        const correctAnswer = questionData.correctAnswer;
        const isCorrect = userAnswer === correctAnswer;
        
        return (
          <div key={questionData.id} className='questionResult'>
            <div className='questionText'>
              <strong>Q{questionData.id}:</strong> {questionData.question}
            </div>
            
            {/* Show options if available */}
            {questionData.options && (
              <div className='questionOptions'>
                <strong>Options:</strong>
                <ul>
                  {Object.entries(questionData.options[0] || {}).map(([key, value]) => (
                    <li key={key} className={`
                      ${userAnswer === key ? 'userSelected' : ''}
                      ${correctAnswer === key ? 'correctOption' : ''}
                    `}>
                      {key}: {value}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            <div className='answerComparison'>
              <div className='correctAnswer'>
                <strong>Correct answer:</strong> {correctAnswer}
              </div>
              <div className='userAnswer'>
                <strong>Your answer:</strong> {userAnswer || 'Not answered'}
              </div>
            </div>
            
            {questionData.explanation && (
              <div className='explanation'>
                <strong>Explanation:</strong> {questionData.explanation}
              </div>
            )}
            
            <div className='userScore'>
              <strong>Result:</strong> {isCorrect ? 'Correct' : 'Incorrect'}{' '}
              {isCorrect ? (
                <span style={{ color: 'green' }}>
                  <CheckIcon fontSize='medium' />
                </span>
              ) : (
                <span style={{ color: 'red' }}>
                  <ClearIcon fontSize='medium' />
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default Results;