"""
RAG (Retrieval-Augmented Generation) pipeline for healthcare chatbot.
Supports multi-turn diagnostic conversation with history tracking.
"""
import re
import os
import json
import logging
from typing import Optional, List, Dict

logger = logging.getLogger(__name__)

DIAGNOSTIC_SYSTEM_PROMPT = """You are Arogya Sahayak, an AI healthcare assistant. You MUST respond in valid JSON format ONLY.

## CRITICAL RULES
1. You are having a MULTI-TURN CONVERSATION. The conversation history is provided below.
2. NEVER repeat a question you already asked in the conversation history.
3. NEVER include symptoms/options the user already confirmed or denied.
4. After at most 2-3 clarifying questions, you MUST provide your assessment with:
   - What the user likely has
   - Severity level
   - Home remedies / precautions
   - When to see a doctor
5. If the user describes clear symptoms from the start, skip questions and go directly to assessment.
6. Use the MEDICAL KNOWLEDGE provided to give accurate, sourced information.
7. When medical knowledge is available, reference the specific source in sources_note.

## CONVERSATION FLOW (follow strictly):
- Turn 1 (user describes symptom): Ask 1 focused clarifying question with UNIQUE options
- Turn 2 (user answers): Ask 1 MORE different clarifying question OR give assessment if enough info
- Turn 3+: MUST give full assessment. Do NOT ask more questions.

## Response JSON Format:
{
  "message_type": "diagnostic_question" | "assessment",
  "greeting": "Brief empathetic acknowledgment of what user said",
  "content": [
    {"type": "text", "value": "Main response paragraph"},
    {"type": "heading", "value": "Section Title"},
    {"type": "point", "icon": "emoji", "title": "Title", "detail": "Brief detail"},
    {"type": "warning", "value": "Critical safety warning"}
  ],
  "follow_up": {
    "question": "Your clarifying question (DIFFERENT from any previous question)",
    "options": ["Option A", "Option B", "Option C", "Option D"]
  },
  "sources_note": "e.g. WHO Guidelines 2024, ICMR Protocol, National Health Portal"
}

## For ASSESSMENT responses (message_type = "assessment"):
- Set follow_up to null
- Include these sections in content:
  1. A "heading" with "Likely Condition"
  2. "point" items with the possible conditions and confidence
  3. A "heading" with "Recommended Actions"  
  4. "point" items with specific precautions/remedies (use icons: 🛌 rest, 💧 hydration, 🍎 diet, 💊 medicine, 🌡️ monitoring)
  5. A "heading" with "When to See a Doctor"
  6. "warning" with red-flag symptoms that need immediate medical attention
  7. A "heading" with "Home Remedies"
  8. "point" items with safe home treatments

## Icon Guide:
🤒 fever, 🤕 headache, 💊 medicine, 🏥 hospital, 🛌 rest, 💧 water/hydration,
🍎 diet/food, ⚠️ warning, ✅ positive, 🩺 doctor, 🧪 test, 🌡️ temperature,
😷 cold/cough, 🤢 nausea, 💪 exercise, 🧘 relaxation, 🍵 warm drinks
"""


def check_emergency(text: str) -> Optional[str]:
    """Check if user message contains emergency keywords."""
    from config.models import GuardrailConfig
    config = GuardrailConfig.load()
    keywords = [kw.strip().lower() for kw in config.emergency_keywords.split(',') if kw.strip()]
    text_lower = text.lower()
    for kw in keywords:
        if kw in text_lower:
            return config.emergency_response
    return None


def redact_pii(text: str) -> str:
    """Remove PII from text."""
    text = re.sub(r'\b[6-9]\d{9}\b', '[PHONE]', text)
    text = re.sub(r'\b\d{4}\s?\d{4}\s?\d{4}\b', '[AADHAAR]', text)
    text = re.sub(r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b', '[EMAIL]', text)
    return text


def retrieve_context(query: str, top_k: int = 5, threshold: float = 0.5, user_id: int = None) -> list:
    """Retrieve relevant chunks from vector DB."""
    try:
        from knowledge.processor import get_embedding_model
        from knowledge.vector_store import VectorStoreFactory

        store = VectorStoreFactory.get_store()
        model = get_embedding_model()
        query_embedding = model.encode([query]).tolist()[0]

        # Use new user_id parameter if PostgreSQL, else it's ignored for Chroma
        if hasattr(store, 'connection'):
            contexts = store.search(query_embedding, top_k, threshold, user_id=user_id)
        else:
            contexts = store.search(query_embedding, top_k, threshold)
            
        return contexts

    except Exception as e:
        logger.error(f"Context retrieval failed: {e}")
        return []


def build_prompt_with_history(query: str, contexts: list, history: List[Dict],
                               language: str = 'EN') -> str:
    """Build prompt with conversation history and retrieved context."""

    # Language instruction
    lang_map = {
        'HI': 'Hindi', 'EN': 'English', 'BN': 'Bengali',
        'TA': 'Tamil', 'TE': 'Telugu', 'MR': 'Marathi'
    }
    lang_instruction = ""
    if language != 'EN':
        lang_name = lang_map.get(language, 'English')
        lang_instruction = f"\n\nIMPORTANT: Write all content values in {lang_name}. Keep JSON keys in English."

    # RAG context
    context_text = ""
    if contexts:
        context_text = "\n\n=== MEDICAL KNOWLEDGE BASE (use this for your answer) ===\n"
        for ctx in contexts:
            context_text += f"\n[Source: {ctx['source']}, Relevance: {ctx['similarity']:.0%}]\n{ctx['text']}\n"
        context_text += "\n=== END KNOWLEDGE ===\n"
        context_text += "\nYou MUST use the above knowledge to answer. Reference the source name in sources_note."
    else:
        context_text = "\n\nNote: No specific knowledge base data matched this query. Give general guidance."

    # Conversation history
    history_text = ""
    if history and len(history) > 1:  # More than just the current message
        history_text = "\n\n=== CONVERSATION HISTORY (DO NOT repeat questions from here) ===\n"
        # Count how many AI turns we've had (to know when to force assessment)
        ai_turn_count = 0
        for msg in history[:-1]:  # Exclude current message (already at end)
            role = "User" if msg['sender'] == 'user' else "Assistant"
            # Truncate long AI responses to save token space
            text = msg['text']
            if msg['sender'] == 'ai' and len(text) > 200:
                text = text[:200] + "..."
            history_text += f"{role}: {text}\n"
            if msg['sender'] == 'ai':
                ai_turn_count += 1

        history_text += "=== END HISTORY ===\n"

        if ai_turn_count >= 2:
            history_text += f"\n⚠️ You have already asked {ai_turn_count} questions. You MUST provide a full ASSESSMENT now. Set message_type to 'assessment' and follow_up to null. DO NOT ask any more questions.\n"
        elif ai_turn_count >= 1:
            history_text += "\n⚠️ You already asked 1 question. Ask at most 1 more DIFFERENT question, or give assessment if you have enough information.\n"

    prompt = f"{DIAGNOSTIC_SYSTEM_PROMPT}{lang_instruction}\n{context_text}{history_text}\n\nUser's latest message: {query}\n\nRespond with valid JSON only:"
    return prompt


def generate_response_gemini(prompt: str, api_key: str, model_name: str,
                              temperature: float = 0.7, max_tokens: int = 2048) -> str:
    """Generate response using Google Gemini API."""
    try:
        from google import genai
        from google.genai import types

        client = genai.Client(api_key=api_key)

        if not model_name.startswith('models/'):
            full_model = f"models/{model_name}"
        else:
            full_model = model_name

        response = client.models.generate_content(
            model=full_model,
            contents=prompt,
            config=types.GenerateContentConfig(
                temperature=temperature,
                max_output_tokens=max_tokens,
                response_mime_type="application/json",
            ),
        )
        return response.text

    except ImportError:
        import google.generativeai as genai_old
        genai_old.configure(api_key=api_key)
        model = genai_old.GenerativeModel(model_name)
        response = model.generate_content(
            prompt,
            generation_config={"temperature": temperature, "max_output_tokens": max_tokens}
        )
        return response.text


def generate_response_openai(prompt: str, api_key: str, model_name: str,
                              temperature: float = 0.7, max_tokens: int = 2048) -> str:
    """Generate response using OpenAI API."""
    from openai import OpenAI
    client = OpenAI(api_key=api_key)
    response = client.chat.completions.create(
        model=model_name,
        messages=[{"role": "user", "content": prompt}],
        temperature=temperature,
        max_tokens=max_tokens,
        response_format={"type": "json_object"},
    )
    return response.choices[0].message.content


def parse_ai_response(raw_text: str) -> dict:
    """Parse AI response JSON with robust fallback."""
    try:
        cleaned = raw_text.strip()
        if cleaned.startswith('```json'):
            cleaned = cleaned[7:]
        if cleaned.startswith('```'):
            cleaned = cleaned[3:]
        if cleaned.endswith('```'):
            cleaned = cleaned[:-3]
        cleaned = cleaned.strip()

        data = json.loads(cleaned)

        if 'content' not in data:
            raise ValueError("Missing 'content' key")

        # Ensure follow_up is None if empty
        if data.get('follow_up') == {} or data.get('follow_up') == '':
            data['follow_up'] = None

        return data

    except (json.JSONDecodeError, ValueError) as e:
        logger.warning(f"Failed to parse AI JSON: {e}. Converting to structured format.")
        return {
            'message_type': 'general_info',
            'greeting': '',
            'content': [{'type': 'text', 'value': raw_text}],
            'follow_up': None,
            'sources_note': ''
        }


def get_ai_response(query: str, language: str = 'EN',
                     history: Optional[List[Dict]] = None, user_id: int = None) -> dict:
    """
    Full RAG pipeline with conversation history:
    1. Check guardrails (emergency, PII)
    2. Retrieve relevant context from vector DB
    3. Build prompt with history
    4. Generate response via LLM
    5. Parse structured response
    """
    from config.models import LLMConfig, VectorDBConfig, GuardrailConfig

    vector_config = VectorDBConfig.load()
    guardrails = GuardrailConfig.load()

    if history is None:
        history = []

    # Step 1: Emergency check
    emergency = check_emergency(query)
    if emergency:
        return {
            'text': '',
            'structured': {
                'message_type': 'assessment',
                'greeting': '🚨 Emergency Detected',
                'content': [
                    {'type': 'warning', 'value': emergency},
                    {'type': 'point', 'icon': '📞', 'title': 'Call 112 Now', 'detail': 'National emergency helpline'},
                    {'type': 'point', 'icon': '🏥', 'title': 'Go to Hospital', 'detail': 'Visit nearest emergency room immediately'},
                ],
                'follow_up': None,
                'sources_note': 'National Emergency Response Protocol'
            },
            'verified': False,
            'warning': 'Emergency detected',
            'sources': [],
            'confidence': 100,
        }

    # Step 2: PII redaction
    processed_query = redact_pii(query) if guardrails.pii_redaction else query

    # Step 3: Retrieve context — search using ALL symptoms mentioned in conversation
    # Build a comprehensive search query from history + current message
    search_terms = [processed_query]
    for msg in history:
        if msg['sender'] == 'user':
            search_terms.append(msg['text'])
    combined_search = ' '.join(search_terms[-5:])  # Last 5 user messages

    # Use lower threshold for better recall
    threshold = max(vector_config.similarity_threshold - 0.15, 0.3)
    filtered_contexts = retrieve_context(combined_search, top_k=vector_config.top_k, threshold=threshold, user_id=user_id)

    # Step 4: Build prompt with history
    prompt = build_prompt_with_history(processed_query, filtered_contexts, history, language)

    # Step 5: Generate
    llm_config = LLMConfig.load()
    api_key = llm_config.api_key or os.getenv('GEMINI_API_KEY', '') or os.getenv('OPENAI_API_KEY', '')

    if not api_key:
        return {
            'text': '',
            'structured': {
                'message_type': 'assessment',
                'greeting': 'Configuration Required',
                'content': [
                    {'type': 'warning', 'value': 'API key not set. Go to Admin → LLM Configuration to add your Gemini API key.'}
                ],
                'follow_up': None,
                'sources_note': ''
            },
            'verified': False, 'warning': '', 'sources': [], 'confidence': 0,
        }

    try:
        if llm_config.provider == 'openai':
            response_text = generate_response_openai(
                prompt, api_key, llm_config.model_name,
                llm_config.temperature, llm_config.max_tokens
            )
        else:
            response_text = generate_response_gemini(
                prompt, api_key, llm_config.model_name,
                llm_config.temperature, llm_config.max_tokens
            )
    except Exception as e:
        logger.error(f"LLM generation failed: {e}")
        return {
            'text': '',
            'structured': {
                'message_type': 'assessment',
                'greeting': '',
                'content': [{'type': 'warning', 'value': f"Error: {str(e)[:100]}. Please try again."}],
                'follow_up': None,
                'sources_note': ''
            },
            'verified': False, 'warning': '', 'sources': [], 'confidence': 0,
        }

    # Step 6: Parse structured response
    structured = parse_ai_response(response_text)

    # Add disclaimer
    if guardrails.disclaimer_text:
        structured.setdefault('content', []).append({
            'type': 'disclaimer',
            'value': guardrails.disclaimer_text,
        })

    # Determine verification
    is_verified = len(filtered_contexts) > 0
    avg_sim = sum(c['similarity'] for c in filtered_contexts) / len(filtered_contexts) if filtered_contexts else 0
    sources = [{'source': c['source'], 'similarity': c['similarity']} for c in filtered_contexts[:3]]

    # If we have sources, add them to the sources_note if not already set
    if is_verified and not structured.get('sources_note'):
        source_names = list(set(s['source'] for s in sources))
        structured['sources_note'] = f"Data from: {', '.join(source_names)}"

    return {
        'text': response_text,
        'structured': structured,
        'verified': is_verified,
        'warning': '',
        'sources': sources,
        'confidence': round(avg_sim * 100, 1),
    }
