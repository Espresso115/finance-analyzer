### 1. API Gateway
```bash
pnpm dev
```

### 2. LLM Service
```bash
cd apps/llm-service
python -m venv venv
\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

### 3. RAG Service
```bash
cd apps/rag-service
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8101 --reload
```

### 4. Parser Service (Python / FastAPI)
```bash
cd apps/parser-service
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8103 --reload
```
