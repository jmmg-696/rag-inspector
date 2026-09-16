"""Prompt construction — deterministic and fully inspectable.

The exact prompt returned by build_prompt() is the one sent to Ollama and
the one shown in the Prompt Inspector. Nothing else is prepended anywhere,
so what you see is what the model got.

Anti-hallucination and citation discipline are explicit rules because
RAG Inspector's job is to teach how RAG behaves — including when it
refuses to invent.
"""

from __future__ import annotations

from typing import Any

from .. import settings
from .context_service import ContextResult

DEFAULT_SYSTEM_PROMPT = """You are a document assistant inside RAG Inspector, answering ONLY with the context provided below.

Rules:
- Use the provided context as your primary source of information.
- Do not invent facts that are not supported by the context.
- If the context does not contain enough information to answer, say exactly that the available documents do not provide enough information.
- Cite the sources you used with their identifiers, for example [SOURCE_1] or [SOURCE_2].
- Never cite an identifier that does not appear in the context.
- If you add anything from general knowledge, mark it clearly as "(general knowledge)".

Context:"""

USER_TEMPLATE = """Question:
{question}

Answer with citations:"""


def system_prompt() -> str:
    return settings.RAG_SYSTEM_PROMPT or DEFAULT_SYSTEM_PROMPT


def build_prompt(
    context: ContextResult, question: str
) -> dict[str, Any]:
    system = system_prompt()
    context_text = context.text()
    user = USER_TEMPLATE.format(question=question)
    full = f"{system}\n\n{context_text}\n\n{user}"
    return {
        "system": system,
        "context": context_text,
        "user": user,
        "full_prompt": full,
    }
