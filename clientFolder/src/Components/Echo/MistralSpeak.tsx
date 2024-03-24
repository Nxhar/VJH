import { useState, useRef } from "react"
import { SyncLoader } from "react-spinners";

// Your other imports and code
function MistralSpeak() {

    const fileRef = useRef(null)

    const [file, setFile] = useState(null)
    const [selectedFile, setSelectedFile] = useState('');
    const [loader, setLoader] = useState(false);
    const [fileNotSent, setFileNotSent] = useState(true)
    const [res, setRes] = useState('')
    

    const handleFileChange = (e) => {
        const currentFile = e.target.files[0];
        setFile(currentFile);
        setSelectedFile(currentFile.name);
      };
    
    
      const handleSendFile = async () => {
        if (!file) {
          alert('Error, no file sent');
          return;
        }

    
        setFileNotSent(false);
    
        const formData = new FormData();
        formData.append('file', file);
    
        setLoader(true);
    
        try {
          const response = await fetch('http://127.0.0.1:5000/audio', {
            method: 'POST',
            body: formData,
          });
    
          const result = await response.json();
          console.log(result['response']);
          console.log(result + ' ' + result['response']);
          // Handle the response from the server
          if (result['response'] !== 'error') {
            setRes(result['response'])
    
            setLoader(false);
          } else {
            return;
          }
        } catch (error) {
          console.error('Error uploading file:', error);
        }
      };
    

    


  return (
    <div className='rightPane centralize' style={{backgroundColor:'white', color:'black'}}>
        <div className="top">
            <h2 className='echotitle'>MistralEcho</h2>
            <p className='echodesc'>An AI that extracts questions on a given audio.</p>
            <p className="echodesc">The Fastest Fingers First, gets the Prize that Quenches their Thirst!</p>

            
            {fileNotSent && (
                <div className="imageContainer">
                <div className="mainContainer">
                    <input name="audioFile" ref={fileRef} type="file" style={{ display: 'none' }} onChange={handleFileChange} />
                    <label className="labelFor" htmlFor="audioFile" onClick={() => fileRef.current.click()}>
                    {selectedFile || 'Select your audio file here! '}
                    </label>
                    <div className="sendbtn" onClick={handleSendFile}>
                    Send
                    </div>
                </div>
                </div>
            )}
            <div className="flexSpeak">
                {!fileNotSent && 
                    (loader ? (<><SyncLoader /> <div>Loading... This might take a while</div>  </>) : (<><div>Questions : </div><div>{res.split('2.')[0]}</div>{res.split(res.split('2.')[0])[1] }</>) )}
            </div>
        </div>

    </div>
  )
}

export default MistralSpeak