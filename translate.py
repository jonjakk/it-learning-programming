import os
import openai
from dotenv import load_dotenv
import re

primer = """os.environ["maze"] = "maze"]"""

# Takes code as a string and returns the translated python code
def translate(code, maze):
    load_dotenv()
    openai.api_key = os.environ["OPENAI_API_KEY"]
    # openai.organization_id = os.environ["ORGANIZATION_ID"]

    #Here is where  the code is translated from pseudo-code to python
    #Primed the model with understanding the language
    #TODO Translate the maze to python which can then be used in exec() in evaluate.py

    # Read the content of the "pseudo_lang.txt" file
    with open("pseudo_lang.txt", "r") as file:
        pseudo_structure = file.read()

    # test_code = "while ($i < 8) { print($i); $i++; } name2 = "Max";"
    # OpenAI API call
    response = openai.ChatCompletion.create(
    model="gpt-4",
    messages=[
            {"role": "system", "content": "You are a helpful assistant converting pseudo language to python language."},
            {"role": "user", "content": f"In the future I want you to convert the given pseudo code in python language. This is the structure of the pseudo code that will be given: {pseudo_structure}"},
            {"role": "assistant", "content": "Thanks for the pseudo code structure. I will use it to convert the given pseudo code to python code."},
            {"role": "user", "content": f"Covert this code to python and just give the converted python code as the result so that I can extract it like this '```python(.*?)```': {code}"},
        ]
    )
    # Extract the answer from the API response
    answer = response['choices'][0]['message']['content']

    # Extract the Python code from the output
    code_pattern = re.compile(r'```python(.*?)```', re.DOTALL)
    python_code = code_pattern.search(answer)
    if python_code:
        extracted_code = python_code.group(1).strip()
    else:
        extracted_code = "" #TODO Handle this error

    return extracted_code