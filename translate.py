from openai import OpenAI
import os
import openai

primer = """os.environ["maze"] = "maze"]"""

def translate(code, maze):
    #Here is where you will translate the code from pseudo-code to python
    openai.api_key = os.getenv("OPENAI_API_KEY")
    
    #TODO Prime the model with understanding the language
    response = openai.Completion.create(
    model="text-davinci-003",
    prompt=primer,
    temperature=0.7,
    max_tokens=256,
    top_p=1,
    frequency_penalty=0,
    presence_penalty=0
    )
    #TODO Give it the maze and explain that this is a 
    response2 = openai.Completion.create(
    model="text-davinci-003",
    prompt="Convert this code into python: " + code,
    temperature=0.7,
    max_tokens=256,
    top_p=1,
    frequency_penalty=0,
    presence_penalty=0
    )
    response3 = openai.Completion.create(
    model="text-davinci-003",
    prompt="Check if correct, else answer with no: " + response2,
    temperature=0.7,
    max_tokens=256,
    top_p=1,
    frequency_penalty=0,
    presence_penalty=0
    )
    code = "result = 'Hello World'"