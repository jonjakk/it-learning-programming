from typing import List
from fastapi import FastAPI
from evaluate import evaluate
from translate import translate
import os

app = FastAPI()

@app.get("/")
async def root():
    return 

@app.post("/codecheck")
async def codecheck(maze: List[int][int], start: str, end: str, code : str):
    translated_pseudo_code = translate(code, maze)
    result, score, feedback = evaluate(translated_pseudo_code, maze, start, end)
    return {"result": result, "score": score, "feedback": feedback}

@app.post("/updatePsudoLanguage")
async def updatePsudoLanguage(word_to_be_updated: str, definition: str):
    os.environ[word_to_be_updated] = definition #very insecure, but this is just a demo
    return {"word": word_to_be_updated, "definition": definition}