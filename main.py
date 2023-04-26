from typing import List
from fastapi import FastAPI, Request
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
async def codecheck(maze: List[List[int]], start: str, end: str, code: str):
    translated_pseudo_code = translate(code, maze)
    result, score, feedback, path_taken = evaluate(
        translated_pseudo_code, maze, start, end
    )
    return {
        "result": result,
        "score": score,
        "feedback": feedback,
        "path_taken": path_taken,
        "translated_pseudo_code": translated_pseudo_code,
    }


@app.get("/maze/{maze_id}")
async def get_maze(maze_id: int):
    return mock_mazes[maze_id]


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
