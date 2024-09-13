# Natural Language Chatbot Application

This project is a **Natural Language Chatbot** that maintains context history for each user. The chatbot is powered by **FastAPI** on the backend and uses **Ollama LLaMA3 8B** via the **LlamaIndex framework** for language model interactions. The frontend is built using **Vite**, **React** (TypeScript), **Node.js**, and **Tailwind CSS** to create an interactive user interface.

## Features

- **Real-time Chat**: A responsive UI allows users to interact with the chatbot in real-time.
- **Contextual Conversations**: The chatbot maintains conversation context for each user, allowing it to understand the flow of dialogue.
- **Multi-user Support**: Each user has a separate chat history maintained, ensuring personalized conversations.
- **LLM Powered**: Leveraging LLaMA3 8B for natural language understanding and response generation.
- **Scalable Backend**: Built with FastAPI, ensuring fast and scalable API performance.
- **Frontend**: Built using modern frameworks like Vite, React (TS), and Tailwind CSS for smooth user experience and development.

## Installation

### Backend (FastAPI):

1. **Clone the repository**:
    ```bash
    git clone https://github.com/hamnarif/RAG-Chatbot.git
    ```

2. **Set up a virtual environment**:
    ```bash
    python -m venv venv
    source venv/bin/activate  # On Windows: venv\Scripts\activate
    ```

3. **Install the required dependencies**:
    ```bash
    pip install -r requirements.txt
    ```

4. **Start the FastAPI server**:
    ```bash
    uvicorn main:app --reload
    ```

   The FastAPI server should now be running at `http://127.0.0.1:8000`.

### Frontend (Vite, React, Node.js, Tailwind):

1. **Navigate to the frontend folder**:
    ```bash
    cd ../frontend
    ```

2. **Install Node.js dependencies**:
    ```bash
    npm install
    ```

3. **Start the frontend development server**:
    ```bash
    npm run dev
    ```

   The frontend should now be running at `http://localhost:3000`.

