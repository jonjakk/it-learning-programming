import os
import openai

primer = """os.environ["maze"] = "maze"]"""

def translate(code, maze):
    #Here is where you will translate the code from pseudo-code to python
    openai.api_key = os.getenv("OPENAI_API_KEY")
    
    #TODO Prime the model with understanding the language
    
    #TODO Translate the maze to python which can then be used in exec() in evaluate.py
