import os
import json
import uuid

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
SESSOES_FILE = os.path.join(BASE_DIR, 'sessoes.json')

def _load_sessions():
    try:
        with open(SESSOES_FILE, 'r', encoding='utf-8') as f:
            return json.load(f)
    except (FileNotFoundError, json.JSONDecodeError):
        return {}

def _save_sessions(sessoes):
    with open(SESSOES_FILE, 'w', encoding='utf-8') as f:
        json.dump(sessoes, f, indent=4)

def create_session(email):
    """Gera um ID único e atrela ao e-mail do usuário"""
    sessions = _load_sessions()
    
    session_id = str(uuid.uuid4()) 
    
    sessions[session_id] = email
    _save_sessions(sessions)
    
    return session_id

def session_validator(session_id):
    """Verifica se o ID da sessão existe e retorna o e-mail do dono"""
    if not session_id:
        return None
        
    sessoes = _load_sessions()
    return sessoes.get(session_id)