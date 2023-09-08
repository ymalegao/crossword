from fastapi import FastAPI, Request
from fastapi.templating import Jinja2Templates
from fastapi.responses import JSONResponse, HTMLResponse
from fastapi.staticfiles import StaticFiles
from puzz2 import CrosswordPuzzle
import json

with open('./crossword_data.json', 'r') as file:
    crossword_data = json.load(file)

puzzle = CrosswordPuzzle(size=18, crossword_data=crossword_data)

app = FastAPI()

# Serve static files (CSS and JavaScript)
app.mount("/static", StaticFiles(directory="static"), name="static")

# Serve the HTML file using Jinja2Templates
templates = Jinja2Templates(directory=".")

@app.get("/", response_class=HTMLResponse)
@app.get("/crossword", response_class=HTMLResponse)  # Allow both root and /crossword URLs to serve the HTML
async def serve_html(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})

@app.get("/crossword/data")
async def get_crossword_data():
    return JSONResponse(content=crossword_data)
