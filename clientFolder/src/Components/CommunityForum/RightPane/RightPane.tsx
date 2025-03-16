import { useState, useRef, useEffect } from 'react';
import './rightpane.css';
import SendIcon from '@mui/icons-material/Send';
import ChatbotIcon from '../../../Assets/chatboticon.png';
import { SyncLoader } from 'react-spinners';
import { User } from 'firebase/auth';
import { GoogleGenerativeAI } from "@google/generative-ai";

function RightPane({ user, context }: { user: User | null, context: string }) {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([
    {
      type: 'aiMessage',
      content: "Hi! I'm Gyaanvapi, an AI assistant to help your needs. You can ask me anything you like!"
    }
  ]);
  const userIcon = user ? user.photoURL : '';
  const [loadingResponse, setLoadingResponse] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const [genAI, setGenAI] = useState<GoogleGenerativeAI | null>(null);

  useEffect(() => {
    const initializeGemini = async () => {
      try {
        const genAIInstance = new GoogleGenerativeAI('AIzaSyAULeneZJyL7D6Jsy9WUNS3_auYnZU0BWM');
        setGenAI(genAIInstance);
      } catch (error) {
        console.error("Gemini initialization error", error);
      }
    };
    initializeGemini();
  }, []);

  const fetchGeminiResponse = async (prompt: string) => {
    try {
      const response = await fetch('http://localhost:5000/api/gemini', { // URL of your Express server
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt }),
      });
  
      if (!response.ok) {
          const errorData = await response.json();
          throw new Error(`Gemini API Error: ${response.status} - ${errorData.error}`);
      }
  
      const data = await response.json();
      return data.response;
  
    } catch (error) {
      console.error("Error fetching from Gemini API:", error);
      return "Error communicating with Gemini API.";
    }
  };

  const handlePostChatMessage = async () => {
    if (message.trim() === '') {
      return;
    }

    const updatedMessages = [...messages, {
      type: 'userMessage',
      content: message,
    }];

    setMessages(updatedMessages);
    setMessage('');

    if (ref.current) {
      ref.current.scrollIntoView({ behavior: 'smooth' });
    }

    setLoadingResponse(true);

    const prompt = `You are Gyaanvapi, an AI assistant that truthfully answers queries in 100 words.  Question : ${message} Answer : `;

    const response = await fetchGeminiResponse(prompt);

    const newUpdatedMessages = [...updatedMessages, {
      type: 'aiMessage',
      content: response
    }];

    setMessages(newUpdatedMessages);

    if (ref.current) {
      ref.current.scrollIntoView({ behavior: 'smooth' });
    }
    setLoadingResponse(false);
  };

  const handlePostContext = async () => {
    console.log(context);

    const prompt = `You are Gyaanvapi, an AI assistant that speaks about a certain discussion and answers the queries in the discussion if any in 100 words. Discussion : ${context} Answer:;`
    setLoadingResponse(true);

    const response = await fetchGeminiResponse(prompt);

    const newUpdatedMessages = [...messages, {
      type: 'aiMessage',
      content: response
    }];

    setMessages(newUpdatedMessages);

    if (ref.current) {
      ref.current.scrollIntoView({ behavior: 'smooth' });
    }
    setLoadingResponse(false);
  };

  return (
    <>
      <div className="outerRightLayer">
        <div className="title">
          <h2>Chat with Gyaanvapi   </h2>
        </div>
        <div className="Messages" id='Messages'>
          <div className="auto"></div>
          {messages.map((message, index) => (
            <div key={index} className={message['type']}>
              <img src={message['type'] === 'aiMessage' ? ChatbotIcon : userIcon} alt="UI" className="chat-user-icon" />
              <div className="messageText">{message['content']}</div>
            </div>
          ))}

          {loadingResponse ?
            <div className="aiMessage">
              <img src={ChatbotIcon} alt="" className="chat-user-icon" />
              <SyncLoader style={{ marginLeft: '10px' }} color='#9b51e0' size={10} margin={5} speedMultiplier={0.5} />
            </div> : <></>
          }

          <div className="bottomOfTheContent" ref={ref}></div>
        </div>

        <div className="bottomRightLayer" onSubmit={async (e) => { e.preventDefault(); await handlePostChatMessage(); }}>
          <form className="bottomInputBox">
            <input type="text" className='textbox' value={message} onChange={(e) => { setMessage(e.target.value) }} placeholder='Ask the AI anything' />
            <SendIcon className='btn' onClick={handlePostChatMessage} />
          </form>

          {context !== '' && (<div className='getInsights' onClick={handlePostContext}>Get Insights on the Post</div>)}
        </div>
      </div>
    </>
  );
}

export default RightPane;
