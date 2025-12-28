# PDF-RAG Application

This project is a full-stack RAG (Retrieval-Augmented Generation) application with a FastAPI backend and a React frontend.

## Directory Structure

- **backend/**: FastAPI application, logic, and dependencies.
- **frontend/**: React application (Vite + Tailwind CSS).

## Prerequisites

- Python 3.8+
- Node.js & npm

## Setup Instructions

### 1. Backend Setup

Navigate to the backend directory:

```bash
cd backend
```

Install the required dependencies:

```bash
pip install -r requirements.txt
```

**Environment Variables:**
Ensure you have a `.env` file in `backend/` with your API keys (`MISTRAL_API_KEY`, `NOMIC_API_KEY`).

Run the server:

```bash
python main.py
```
The backend will run at `http://localhost:8000`.

### 2. Frontend Setup

Open a new terminal and navigate to the frontend directory:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Run the development server:

```bash
npm run dev
```

The frontend will run at `http://localhost:5173` (or similar).

## Usage

1.  Open the frontend URL (e.g., `http://localhost:5173`).
2.  **URL Mode**: Enter a PDF URL.
3.  **Upload Mode**: Upload a PDF file.
4.  Ask questions!
