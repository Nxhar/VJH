import './aichat.css'
import { useRef, useState } from 'react';
import SendIcon from '@mui/icons-material/Send';
import { SyncLoader } from 'react-spinners';

import ChatbotIcon from '../../Assets/chatboticon.png'

interface SideMenuProps {
    user: {
      photoURL: string;
      displayName: string;
      email: string;
    };
  }
function AIChat({user} : SideMenuProps) {

  const fileRef = useRef(null)

  const [message, setMessage] = useState('')
  const [messages, setMessages] = useState([
    {
      'type' : 'aiMessage',
      'content': "Hi! I'm Mistral Doc, A chatbot to help you learn your documents. Please wait for a while, your document is being loaded!"
    }
  ])

  const [selectedFile, setSelectedFile] = useState('');

  // For checking if atleast one message is present
  // const [anyMessages, setAnyMessages] = useState(false)
  const userIcon = user ? user.photoURL : ''

  const [loader, setLoader] = useState(false);

  const [fileNotSent, setFileNotSent] = useState(true)

  const [file, setFile] = useState(null)


  const handleFileChange = (e) => {
    const currentFile = e.target.files[0]
    setFile(currentFile)
    setSelectedFile(currentFile.name)
  }
  
  const handleSendFile = async () => {
    if(!file){
      alert('Error, no file sent')
      return ;
    }

    setFileNotSent(false)

    const formData = new FormData();
    formData.append('file', file);

    
    setLoader(true);

    try {
      const response = await fetch('http://127.0.0.1:5000/upload', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();
      console.log(result[message])
      console.log(result + ' ' + result['message'])
      // Handle the response from the server
      if(result[message] != 'error')
      {
        
        const newMessage = {
          'type':'aiMessage',
          'content': result['message'] 
        }
        setMessages([...messages, newMessage])

        setLoader(false)
      }
      else{
        return ;
      }
    } catch (error) {
      console.error('Error uploading file:', error);
    }

  }

  const handlePostChatMessage = async () => {
    if (message.trim() === '') {
      return;
    }
  
    
    // Update state using the callback form
    setMessages((prevMessages) => [
      ...prevMessages,
      {
        'type': 'userMessage',
        'content': message,
      },
    ]);

    setLoader(true);
  
    setMessage('');
  
    try {
      const response = await fetch('http://127.0.0.1:5000/message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message }),
      });
  
      const result = await response.json();
      
      setLoader(false)
      // Update state using the callback form
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          'type': 'aiMessage',
          'content': result['response'],
        },
      ]);
  
      console.log(messages);
    } catch (err) {
      console.log(err);
    }
  };
  




  return (
    <div className="chatContainer">
      {fileNotSent && (
        <div className='imageContainer'>
          <img src={ChatbotIcon} alt="" />
          <div className="imageText">DocMistral - Your one stop Document Analysis Teacher!</div>
          <div className="mainContainer">
          <input name='idio' ref={fileRef} type="file" style={{display:'none'}} onChange={handleFileChange} />
          <label className='labelFor' htmlFor='idio' onClick={() =>{fileRef.current.click()}}>
            {selectedFile || 'Select your file here! '} 
          </label>
          <div className='sendbtn' onClick={handleSendFile}>Send</div>
          </div>
        </div>
        )}

      {!fileNotSent && (


        <div className="" style={{marginTop:'auto'}}>
          <div className="" style={{marginTop:'auto'}}>
          {
            messages.map( (message, index) => (
            <div key={index} className={`${message['type']} Message `}>
              <img src={message['type'] === 'aiMessage'? ChatbotIcon : userIcon} alt="UI" className="chat-user-icon" />
              <div className="messageText">{message['content']}</div>
            </div>
          ))}

          {loader && 
            <div className="aiMessage Message">
              <img src={ChatbotIcon} alt="UI" className="chat-user-icon" />
              <SyncLoader style={{marginLeft:'10px'}} color='#9b51e0' size={10} margin={5} speedMultiplier={0.5}/>


            </div>
          }
          </div>
        

        
        <div className="textContainer">
        <div className="textInput">
          <div className="bottomLayer" onSubmit={ async (e)=> {e.preventDefault(); await handlePostChatMessage() }}>
            <form className="inputBox">           
              <input type="text" className='textBox' value={message} onChange={(e)=>{setMessage(e.target.value)}} placeholder='Ask the AI anything or Attach a small Document' />
              <SendIcon className='btn' onClick={handlePostChatMessage} />
            </form>
          </div>
        </div>
      </div>

      </div>
      )}
        

        
    </div>
  )
}


export default AIChat