\# AI Chatbot



A full-stack AI chatbot built using \*\*React, FastAPI, Python, and Groq\*\*. The application provides an interactive chat interface with streaming AI responses.



\## Features



\- Real-time streaming AI responses

\- Interactive chat interface

\- Markdown-formatted responses

\- Copy responses

\- New Chat functionality

\- Message timestamps

\- Responsive user interface



\## Tech Stack



| Technology | Purpose |

|---|---|

| React | Frontend user interface |

| Vite | Frontend development server and build tool |

| Python | Backend programming language |

| FastAPI | Backend API |

| Groq API | AI model integration |

| Git and GitHub | Version control and project hosting |



\## Project Structure



```text

ai-chatbot/

├── backend/

│   ├── app/

│   │   ├── main.py

│   │   ├── config.py

│   │   └── chat.py

│   └── app/requirements.txt

├── frontend/

│   ├── src/

│   │   ├── App.jsx

│   │   ├── App.css

│   │   ├── index.css

│   │   └── main.jsx

│   └── package.json

├── .gitignore

└── README.md

```



\## Getting Started



\### Prerequisites



\- Python

\- Node.js and npm

\- A Groq API key



\### 1. Clone the Repository



```bash

git clone https://github.com/imbasavarajsc/ai-chatbot.git

cd ai-chatbot

```



\### 2. Set Up the Backend



```bash

cd backend

python -m venv venv

```



Activate the virtual environment on Windows:



```bash

venv\\Scripts\\activate

```



Install the dependencies:



```bash

pip install -r app/requirements.txt

```



Create a `.env` file inside the `backend` folder:



```env

APP\_NAME=AI Chatbot API

GROQ\_API\_KEY=your\_groq\_api\_key

GROQ\_MODEL=openai/gpt-oss-120b

```



Replace `your\_groq\_api\_key` with your own API key. Never publish your actual API key.



Start the backend:



```bash

uvicorn app.main:app --reload

```



The API documentation is available at:



http://127.0.0.1:8000/docs



\### 3. Set Up the Frontend



Open a second terminal from the project root:



```bash

cd frontend

npm install

npm run dev

```



Open the local URL printed by Vite, usually:



http://localhost:5173



Keep both the backend and frontend running while using the application.



\## What I Learned



\- Building REST APIs using FastAPI

\- Connecting a React frontend to a Python backend

\- Integrating an AI model through the Groq API

\- Handling streaming responses

\- Managing chat state in React

\- Using Git and GitHub for version control



\## Future Improvements



\- Persistent conversation history

\- Multiple conversation management

\- Improved error handling

\- Deployment for public access



\## Author



\*\*Basavaraj\*\*

Deployment update



GitHub: \[@imbasavarajsc](https://github.com/imbasavarajsc)



