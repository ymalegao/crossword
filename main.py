from fastapi import FastAPI, Request
from fastapi.templating import Jinja2Templates
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse  # Correct import for JSONResponse

from fastapi.responses import HTMLResponse
from puzz2 import CrosswordPuzzle
import json


with open('./crossword_data.json', 'r') as file:
        crossword_data = json.load(file)
    
puzzle = CrosswordPuzzle(size=18, crossword_data=crossword_data)
        
puzzle.generate()
#puzzle.display()


app = FastAPI()

# Serve static files (CSS and JavaScript)
app.mount("/static", StaticFiles(directory="static"), name="static")

# Serve the HTML file using Jinja2Templates
templates = Jinja2Templates(directory=".")

@app.get("/", response_class=HTMLResponse)
async def serve_html(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})



@app.get("/crossword")
async def get_crossword_data():
    return JSONResponse(content=crossword_data)
