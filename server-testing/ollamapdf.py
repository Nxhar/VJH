from langchain.llms import Ollama 

from PyPDF2 import PdfReader

from langchain.embeddings import HuggingFaceEmbeddings
from langchain.text_splitter import CharacterTextSplitter
from langchain.vectorstores import FAISS
from langchain.chains import ConversationalRetrievalChain
from langchain.memory import ConversationBufferMemory

from flask import Flask, request, jsonify
from flask_cors import CORS
from werkzeug.utils import secure_filename
import os
import speech_recognition as sr
from pydub import AudioSegment
from io import BytesIO

app = Flask(__name__)
CORS(app, supports_credentials=True)



llm = Ollama(model='mistral', temperature=0.7)



def get_conversation_chain(file):
    text = ''
    reader = PdfReader(file)
    for page in reader.pages:
        text += page.extract_text()

    text_splitter = CharacterTextSplitter(
    separator = "\n",
    chunk_size = 1000,
    chunk_overlap = 200,
    length_function = len
    )

    chunks = text_splitter.split_text(text)


    embeddings = HuggingFaceEmbeddings()

    vectorstore = FAISS.from_texts(texts = chunks , embedding = embeddings)

    memory = ConversationBufferMemory(memory_key='chat_history', return_messages=True)

    conversation_chain = ConversationalRetrievalChain.from_llm(
        llm = llm,
        retriever = vectorstore.as_retriever(search_kwargs={"k": 2}),
        memory = memory
    )

    return conversation_chain





UPLOAD_FOLDER = './uploads'

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER



def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() == 'pdf'


@app.route('/upload', methods=['POST','OPTIONS'])
def upload_file():
    if request.method == 'OPTIONS':
        response = jsonify({'message': 'CORS preflight request handled successfully'})
        response.headers.add('Access-Control-Allow-Methods', 'POST')
        return response
    
    print('Called method upload file')

    if 'file' not in request.files:
        return jsonify({'error': 'No file part','message':'error'})

    file = request.files['file']

    print('file found')

    if file.filename == '':
        return jsonify({'error': 'No selected file','message':'error'})

    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        try:
            filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
            print('file saved')

            
        except Exception as e:
            return jsonify({'error': f'Error saving file: {str(e)}', 'message':'error'})
        
        global conversation_chain
        conversation_chain = get_conversation_chain(file)
        return jsonify({'message': 'PDF successfully read! You can now ask me any question regarding it.'})

    return jsonify({'error': 'Invalid file','message':'error'})

@app.route('/message', methods=['POST','OPTIONS'])
def get_message():
    if request.method == 'OPTIONS':
        response = jsonify({'message': 'CORS preflight request handled successfully'})
        response.headers.add('Access-Control-Allow-Methods', 'POST')
        return response
    
    data = request.get_json()

    if 'message' not in data:
        return jsonify({'error': 'data not found'})
    
    message = data['message']

    result = conversation_chain({"question": message })

    return jsonify({'response':result['answer']})


@app.route('/audio', methods=['POST', 'OPTIONS'])
def process_audio():
    if request.method == 'OPTIONS':
        # Handle CORS preflight request
        response = jsonify({'message': 'CORS preflight request handled successfully'})
        response.headers.add('Access-Control-Allow-Methods', 'POST')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type')
        return response

    print('Called method upload audio file')

    uploaded_file = request.files['file']

    # Perform speech recognition
    recognizer = sr.Recognizer()
    with sr.AudioFile(uploaded_file) as audio_file:
        audio_data = recognizer.record(audio_file)
        text = recognizer.recognize_google(audio_data)

    question_prompt =  '''
Generate two questions from the following text : 
'''

    question_prompt += text

    response = llm(question_prompt)

    print(response)

    # Set CORS headers specifically for the /audio route
    headers = {
        'Access-Control-Allow-Origin': '*',  # You can adjust this to be more specific if needed
        'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Allow-Headers': 'Content-Type',
    }

    return jsonify({'response': response}), 200, headers






    

if __name__ == '__main__':
    app.run(debug=True)
