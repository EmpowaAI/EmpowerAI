# AI Service Deployment Guide

## Local Development

### Prerequisites
- Python 3.10+
- pip

### Setup

```bash
cd ai-service
python -m venv venv
venv\Scripts\activate  # Windows
# or: source venv/bin/activate  # Mac/Linux

pip install -r requirements.txt
```

### Environment Variables

Create `.env` file:
```env
OPENAI_API_KEY=your-key-here  # Optional
MODEL_NAME=gpt-4
EMBEDDING_MODEL=text-embedding-ada-002
```

### Run

```bash
uvicorn main:app --reload --port 8000
```

Service will be available at: `http://localhost:8000`

API docs at: `http://localhost:8000/docs`

## Production Deployment

### Option 1: Render

1. **Create new Web Service**
   - Connect your GitHub repository
   - Select `ai-service` as root directory

2. **Build Settings**
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `uvicorn main:app --host 0.0.0.0 --port $PORT`

3. **Environment Variables**
   - `OPENAI_API_KEY` (if using)
   - `MODEL_NAME=gpt-4`
   - `EMBEDDING_MODEL=text-embedding-ada-002`

4. **Deploy**
   - Render will automatically deploy on push

### Option 2: Railway

1. **Create new project**
   - Connect GitHub repository
   - Add new service

2. **Configure**
   - Root directory: `ai-service`
   - Start command: `uvicorn main:app --host 0.0.0.0 --port $PORT`

3. **Environment Variables**
   - Add same variables as Render

4. **Deploy**
   - Railway auto-deploys on push

### Option 3: Docker

Create `Dockerfile`:

```dockerfile
FROM python:3.10-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

Build and run:
```bash
docker build -t empowerai-ai-service .
docker run -p 8000:8000 -e OPENAI_API_KEY=your-key empowerai-ai-service
```

## Health Checks

The service has a health endpoint:
```
GET /health
```

Returns:
```json
{
  "status": "healthy",
  "service": "EmpowerAI AI Service",
  "timestamp": "2025-01-XX..."
}
```

## Monitoring

- Check logs in your deployment platform
- Monitor `/health` endpoint
- Set up alerts for 500 errors
- Monitor response times (target: < 4 seconds)

## Performance Tips

1. **Caching**: Consider adding Redis for session storage
2. **Rate Limiting**: Add if needed for production
3. **Connection Pooling**: Already handled by FastAPI/uvicorn
4. **Error Handling**: All endpoints have try-catch blocks

## Troubleshooting

### Service won't start
- Check Python version (need 3.10+)
- Verify all dependencies installed
- Check environment variables

### API errors
- Verify OpenAI API key (if using)
- Check service logs
- Test with `/health` endpoint

### Slow responses
- Check OpenAI API status
- Consider caching frequent requests
- Optimize AI prompts

## Security

- Never commit `.env` file
- Use environment variables for secrets
- Enable HTTPS in production
- Set up CORS properly for your frontend domain

