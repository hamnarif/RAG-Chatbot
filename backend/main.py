# driver.py
from ast import main
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from fastapi.encoders import jsonable_encoder
from rag import chat_engine
from llama_index.core.llms import ChatMessage
from title import chain
app = FastAPI()
import json
# CORS Setup
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",  # You might want to allow this origin as well

    "http://localhost:5713",  # Example frontend development server,
    "https://3cc9-119-73-102-149.ngrok-free.app"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class UserInputRequest(BaseModel):
    user_input: str

@app.post("/process_user_input/")
async def process_user_input(request: UserInputRequest):
    user_input = request.user_input
    window_response = chat_engine.chat( user_input )
    print(window_response)
    result_dict = jsonable_encoder(window_response)

    # result = chain.invoke(user_input)
    # result_dict = jsonable_encoder(result)
    return JSONResponse(content={"answer":result_dict['response']})  

@app.post("/process_user_input_for_title/")
async def process_user_input_for_title(request: UserInputRequest):
    user_input = request.user_input
    res = chain.invoke({"query": user_input})
    print(res)
    # result_dict = jsonable_encoder(res)

    # print(result_dict)
    return JSONResponse(content={"title": res["title"]})  

@app.get("/healthcheck")
async def root():
    return {"message": "Status: OK"}
