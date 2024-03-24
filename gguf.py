from langchain.llms import CTransformers

config = {'max_new_tokens': 512, 'repetition_penalty': 1.1, 'temperature':1}

llm = CTransformers(model='./server/mistral-7b-instruct-v0.1.Q4_K_M.gguf', model_type='llama', config=config)

question = 'What is the Solar System?'

template = f'''
You are a helpful AI assistant that answers questions truthfully and in a way that is easy to understand.
The question is : {question}
Here's the Answer : '''


print(llm(template))

