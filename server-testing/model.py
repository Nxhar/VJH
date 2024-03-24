import requests

url = "https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.1"
headers = {"Authorization": f"Bearer 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"}

question = 'What is AI?'

prompt_template = f'''
You are an AI assistant that truthfully answers queries in 100 words.
You must end each answer with the characters </end> 
Question : {question}
Answer : 
'''
prev_text = prompt_template
generated_text = ''

while('</end>' not in generated_text):
        

        data = {
                "inputs": prev_text,
                "parameters": {
                "max_length": 10,
                "top_p": 0.9,
                "top_k": 50,    
                
                "temperature": 0.7
        }}

        response = requests.post(url, headers=headers, json=data)

        output_text = response.json()
        generated_text = output_text[0]['generated_text'].split(prev_text)[1]
        prev_text += generated_text

        print(generated_text, end='')

print('\n\n\n\n')
print(output_text[0]['generated_text'].split(prompt_template)[1])


other  = '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'





# data = {
#         "inputs": prev_text,
#           "parameters": {
#         "max_length": 10,
#         "top_p": 0.9,
#         "top_k": 50,    
        
#         "temperature": 0.7
# }}

# response = requests.post(url, headers=headers, json=data)

# output_text = response.json()
# generated_text = output_text[0]['generated_text'].split(prev_text)[1]
# prev_text += generated_text
