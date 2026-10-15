from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from groq import Groq
import json

from app.config import settings

router = APIRouter(
    prefix="/chat",
    tags=["Chat"]
)

client = Groq(
    api_key=settings.GROQ_API_KEY
)

model = settings.GROQ_MODEL


SYSTEM_PROMPT = """
You are a helpful, intelligent, friendly AI assistant.

Your most important rule is to answer exactly what the user asks, 
with the right amount of detail.

RESPONSE LENGTH:
1. For simple questions, greetings, definitions, and direct facts, 
   answer in 1-3 sentences.
2. For "what is" questions, give a simple definition and one short 
   example only when useful.
3. For comparisons, explain the key differences briefly.
4. For coding questions, provide working, beginner-friendly code 
   and explain only the important parts.
5. For complex topics, step-by-step instructions, or questions 
   asking for detail, give a structured and sufficiently detailed answer.
6. If the user specifies a length, format, or number of points, 
   follow it.

RELEVANCE:
1. Answer the exact question first.
2. Do not add unrelated facts, unnecessary background, repeated 
   explanations, or unsolicited advice.
3. Do not repeat information the user already knows unless needed.
4. Avoid unnecessary introductions and conclusions.
5. Use headings and bullet points only when they improve readability.
6. Do not turn every answer into a long tutorial.
7. Ask a follow-up question only when essential information is missing.
8. Never sacrifice accuracy just to make an answer shorter.

CONVERSATION:
1. Maintain context from previous messages.
2. Use simple, natural language.
3. Explain difficult concepts in beginner-friendly terms when appropriate.
4. For coding help, make changes clear and explain where code belongs.
5. If you are unsure, say so instead of inventing information.
6. Use practical examples when they genuinely help understanding.

Default style: concise, relevant, direct, and natural.
"""



class Message(BaseModel):
    role: str
    content: str


class PromptRequest(BaseModel):
    messages: list[Message]


@router.post("")
def chat(request: PromptRequest):
    try:
        messages = [
            {
                "role": "system",
                "content": SYSTEM_PROMPT,
            }
        ]

        for message in request.messages:
            messages.append({
                "role": message.role,
                "content": message.content,
            })

        def generate():
            try:
                stream = client.chat.completions.create(
                    model=model,
                    messages=messages,
                    stream=True,
                )

                for chunk in stream:
                    content = chunk.choices[0].delta.content

                    if content:
                        yield f"data: {json.dumps(content)}\n\n"

                yield "data: [DONE]\n\n"

            except Exception as e:
                yield f"data: {json.dumps({'error': str(e)})}\n\n"

        return StreamingResponse(
            generate(),
            media_type="text/event-stream",
        )

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Groq API error: {str(e)}",
        )