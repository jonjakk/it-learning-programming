from typing import List
from fastapi import FastAPI, Request, Body
from evaluate import evaluate
from translate import translate
import os
from fastapi.middleware.cors import CORSMiddleware
from fastapi.templating import Jinja2Templates
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles


app = FastAPI()
templates = Jinja2Templates(directory="three-maze")
app.mount("/static", StaticFiles(directory="static"), name="static")

origins = ["http://localhost:9000", "localhost:9000"]

# origins = [
#     "https://it-learning-programming.vercel.app/",
#     "it-learning-programming.vercel.app"
# ]


app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/", response_class=HTMLResponse)
async def get(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})


@app.post("/codecheck")
async def codecheck(maze_id: int = Body(...), code: str = Body(...)):
    maze = get_maze(maze_id)
    translated_pseudo_code = translate(code, maze)
    result, score, feedback, path_taken = evaluate(
        translated_pseudo_code, maze
    )
    return {
        "result": result, #Boolean, True if the maze was solved
        "score": score, #Integer, score from 0 to 100
        "feedback": feedback, #String, feedback from the evaluation
        "path_taken": path_taken, #List of tuples, the path taken by the algorithm [(1, 2), (1, 3), (1, 4), (2, 4), (3, 4), (4, 4)]
        "translated_pseudo_code": translated_pseudo_code, #String, the translated pseudo code,
        "code": code #String, the original code
    }


@app.get("/maze/{maze_id}")
async def get_maze(maze_id: int):
    return mock_mazes[maze_id]

#Mock for testing of UI
@app.post("/mock_codecheck")
async def codecheck(maze_id: int = Body(...), code: str = Body(...)):
    return {
            "result": True, #Boolean, True if the maze was solved
            "score": 95, #Integer, score from 0 to 100
            "feedback": "You did well on the labyrinth, but you can improve a lot in Area X", #String, feedback from the evaluation
            "path_taken": [(1, 2), (1, 3), (1, 4), (2, 4), (3, 4), (4, 4)], #List of tuples, the path taken by the algorithm [(1, 2), (1, 3), (1, 4), (2, 4), (3, 4), (4, 4)]
            "translated_pseudo_code": "Example Pseudo Code", #String, the translated pseudo code,
            "code": code #String, the original code
        }

mock_mazes = [
    [
        {
            "map": [
                [0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0],
                [0, 0, 1, 0, 1, 1, 0],
                [0, 0, 1, 1, 1, 1, 0],
                [0, 0, 1, 1, 1, 1, 0],
                [0, 0, 1, 1, 1, 1, 0],
                [0, 0, 0, 0, 0, 0, 0],
            ],
            "side": 6, #size of the maze - 1
        }
    ],
    [
        {
            "map": [
                [0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0],
                [0, 0, 1, 0, 1, 1, 0],
                [0, 0, 1, 1, 0, 1, 0],
                [0, 0, 1, 0, 1, 1, 0],
                [0, 0, 1, 1, 1, 1, 0],
                [0, 0, 0, 0, 0, 0, 0],
            ],
            "side": 6,
        }
    ],
    [
        {
            "map": [
                [0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0],
                [0, 0, 1, 0, 1, 1, 0],
                [0, 0, 1, 0, 1, 1, 0],
                [0, 0, 1, 1, 0, 1, 0],
                [0, 0, 1, 1, 1, 1, 0],
                [0, 0, 0, 0, 0, 0, 0],
            ],
            "side": 6,
        }
    ],
]
