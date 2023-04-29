import os
import openai
from dotenv import load_dotenv
import re

def evaluate(code, maze):
    # Here is where you will evaluate the code and return the results
    # start bottom right, end top left
    start = (2 ,2)
    end = (5, 5)
    namespace = {'maze': maze, 'start': start, 'end': end}
    exec(code, {}, namespace)
    # result = namespace["result"]
    result = False
    
    # Call to OpenAI to get the feedback and score
    load_dotenv()
    openai.api_key = os.environ["OPENAI_API_KEY"]
    # openai.organization_id = os.environ["ORGANIZATION_ID"]

    # OpenAI API call
    response = openai.ChatCompletion.create(
        model="gpt-4",
        messages=[
            {"role": "system", "content": "You are a helpful assistant providing feedback and a score for the given python code."},
            {"role": "user", "content": f"I am going to give you a python code which was previously from the pseudo code, so it is normal that there is no comment in the code. Please provide a short feedback and a score (0-100) of the given code. Give the answer so that I will extract them as 'Score:\s*(\d+)' and 'Feedback:\s*(.*)'."},
            {"role": "assistant", "content": "I will give a short feedback and a score out of 100 for the given code. Please provide the Python code."},
            {"role": "user", "content": f"Here is the Python code: {code}"},
        ]
    )
    # Extract the answer from the API response
    answer = response['choices'][0]['message']['content']

    # Extract the score and feedback from the answer
    score_pattern = re.compile(r'Score:\s*(\d+)', re.IGNORECASE)
    feedback_pattern = re.compile(r'Feedback:\s*(.*)', re.IGNORECASE)

    score_match = score_pattern.search(answer)
    feedback_match = feedback_pattern.search(answer)

    if score_match:
        score = int(score_match.group(1))
    else:
        score = 31  # TODO: Handle this error

    if feedback_match:
        feedback = feedback_match.group(1).strip()
    else:
        feedback = "No feedback ^^"  # TODO: Handle this error

    # score = 100
    # feedback = "Nice work!"
    path_taken =  [(5, 5), (4, 5), (3, 5), (2, 5), (2, 4), (2, 3), (2 ,2)]

    return result, score, feedback, path_taken