import { useLocation } from 'react-router-dom';
import { useState } from 'react';
import { solarSystemQuiz } from '../Courses/Assessment/assess.js'; // Import your quiz data
import CheckIcon from '@mui/icons-material/Check';
import ClearIcon from '@mui/icons-material/Clear';
import Button from '@mui/material/Button';
import Modal from '@mui/material/Modal';
import Box from '@mui/material/Box';

function Results() {
  const { state } = useLocation();
  const { newdata } = state || {};
  const [open, setOpen] = useState(false);

  if (!newdata) {
    return <p>No results found.</p>;
  }

  const { averageScore, scores } = newdata;
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
      { title: 'Advanced Concepts in Solar System', url: 'https://www.youtube.com/embed/kBs2-J6k8vM' },
      { title: 'Exploring Space Beyond Our Solar System', url: 'https://www.youtube.com/embed/zeaFHgsDs1I' },
    ],
    'Average Learner': [
      { title: 'Intermediate Guide to Solar System', url: 'https://www.youtube.com/embed/libKVRa01L8' },
      { title: 'Solar System Basics Reinforced', url: 'https://www.youtube.com/embed/x1QTc5YeO6w' },
    ],
    'Slow Learner': [
      { title: 'Introduction to the Solar System', url: 'https://www.youtube.com/embed/yaPhKc31zPs' },
      { title: 'Beginner’s Guide to Solar System', url: 'https://www.youtube.com/embed/lcZTcfdZ3Ow' },
    ],
  };

  // Find the relevant quiz questions from the assess.js data
  const questions = solarSystemQuiz['Solar System'];

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


      <div className="center">
        <button onClick={handleOpen} className='recButton' style={{ fontSize: '18px' }}>
          Based on your results, Here are some recommendations to improve yourself!
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
            <button className=' recButton' onClick={handleClose} >
              Close
            </button>
          </div>
        </Box>
      </Modal>

      <h3>Question Results</h3>
      {questions.map((questionData) => {
        const userScore = scores[questionData.id]; // Get the user's score for the question
        const isCorrect = userScore === 1; // Check if the user got the question correct

        return (
          <div key={questionData.id} className='questionResult'>
            <div className='questionText'>
              Q{questionData.id}: {questionData.question}
            </div>
            <div className='correctAnswer'>
              <strong>Correct answer:</strong> {questionData.answer}
            </div>
            <div className='userScore'>
              Score: {userScore}{' '}
              {isCorrect ? (
                <span style={{ color: 'light-green' }}>
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
