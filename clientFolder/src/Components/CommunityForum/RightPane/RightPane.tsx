import {useState, useRef} from 'react'
import './rightpane.css'
import SendIcon from '@mui/icons-material/Send';
import ChatbotIcon from '../../../Assets/chatboticon.png'
import { SyncLoader } from 'react-spinners';

import { User } from 'firebase/auth';


function RightPane({user, context}: { user: User | null, context: string }) {

  const [message, setMessage] = useState('')
  const [messages, setMessages] = useState([
    {
      'type' : 'aiMessage',
      'content': "Hi! I'm Gyaanvapi, an AI assistant to help your needs. You can ask me anything you like!"
    }
  ])
 

  // For checking if atleast one message is present
  // const [anyMessages, setAnyMessages] = useState(false)
  const userIcon = user ? user.photoURL : ''

  const [loadingResponse, setLoadingResponse] = useState(false)

  const ref = useRef<HTMLDivElement>(null);

  


  // ---------- FETCHING RESPONSE FROM BACKEND ----------------

  const fetchResponse = async (prompt_template: string) => {
    let response = '';
    
    let prev_text = prompt_template;
    let generated_text = '';
    let resp;
  
    try {
      while (!generated_text.includes('</end>')) {
        const res = await fetch(
          'https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.1',
          {
            headers: {
              Authorization: 'Bearer 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',
              'Content-Type': 'application/json', // Add this line to set the content type
            },
            method: 'POST',
            body: JSON.stringify({ inputs: prev_text }), // Correct the structure of the payload
          }
        );
  
        resp = await res.json();
        generated_text = resp[0]['generated_text'].split(prev_text)[1];
        prev_text += generated_text;
  
        console.log(generated_text); // Log the generated text for debugging
      }
  
      response = resp[0]['generated_text'].split(prompt_template)[1];
  
      // After finishing fetching -
      setLoadingResponse(false); // Commented out because setLoadingResponse is not defined
      response = await response.split('</end>')[0]
      return response;
    } catch (err) {
      console.error(err);
      return '';
    }
  };

  

  const handlePostChatMessage = async () => {

    
    if(message.trim() == ''){
      return ;
    }

    const updatedMessages = [...messages, {
      'type':'userMessage',
      'content':message,
    }]

    setMessages(updatedMessages)
    setMessage('')

    if(ref.current){
      ref.current.scrollIntoView({ behavior: 'smooth' });
    }
    

    // Logic to handle Post Request 
    setLoadingResponse(true)

    const prompt_template = `
      You are Gyaanvapi, an AI assistant that truthfully answers queries in 100 words.
      You must end each answer with the characters </end> 
      Question : ${message}
      Answer : 
    `;

    const response = await fetchResponse(prompt_template)

    const newUpdatedMessages = [...updatedMessages, {
      'type':'aiMessage',
      'content':response
    }]

    setMessages(newUpdatedMessages)
    
    if(ref.current){
      ref.current.scrollIntoView({ behavior: 'smooth' });
    }

  }
  
  // const prompt_template = `
  //    You are an AI assistant that speaks about a certain discussion and answers the queries in the discussion if any in 100 words.
  //    You must end each answer with the characters </end> 
  //    Discussion : ${context}
  //    Answer:
  // `;  

  const handlePostContext = async () => {
    console.log(context)
    
    const prompt_template = `
       You are Gyaanvapi, an AI assistant that speaks about a certain discussion and answers the queries in the discussion if any in 100 words.
       You must end each answer with the characters </end> 
       Discussion : ${context}
       Answer:
    `;  
    setLoadingResponse(true)

    const response = await fetchResponse(prompt_template)

    const newUpdatedMessages = [...messages, {
      'type':'aiMessage',
      'content':response
    }]

    setMessages(newUpdatedMessages)
    
    if(ref.current){
      ref.current.scrollIntoView({ behavior: 'smooth' });
    }


    
  }
  
  return (
    <>
    <div className="outerRightLayer">
      <div className="title">
        <h2>Chat with Gyaanvapi   </h2>
      </div>
      <div className="Messages" id='Messages'>

        <div className="auto"></div>

        {/* Static Messages for NOW */}

        {
          messages.map( (message, index) => (
            <div key={index} className={message['type']}>
              <img src={message['type'] === 'aiMessage'? ChatbotIcon : userIcon} alt="UI" className="chat-user-icon" />
              <div className="messageText">{message['content']}</div>
            </div>
          ))
        }

        {
          loadingResponse ? 
          <div className="aiMessage">
            <img src={ChatbotIcon} alt="" className="chat-user-icon" />
            <SyncLoader style={{marginLeft:'10px'}} color='#9b51e0' size={10} margin={5} speedMultiplier={0.5}/>
          </div> : <> </>
        }

      <div className="bottomOfTheContent" ref={ref}></div>

         {/* End of MESSAGES DIV  */}
      </div>

      <div className="bottomRightLayer" onSubmit={ async (e)=> {e.preventDefault(); await handlePostChatMessage() }}>
        <form className="bottomInputBox">
          <input type="text" className='textbox' value={message} onChange={(e)=>{setMessage(e.target.value)}} placeholder='Ask the AI anything' />
          <SendIcon className='btn' onClick={handlePostChatMessage}/>
        </form>

        {context!=='' && (<div className='getInsights' onClick={handlePostContext}>Get Insights on the Post</div>)}

        
      </div>
    </div>
    

    </>
  )
}

export default RightPane