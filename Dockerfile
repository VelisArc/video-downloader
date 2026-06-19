FROM python:3.11-slim
WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates \
    ffmpeg \
    nodejs \
    && rm -rf /var/lib/apt/lists/*

COPY backend/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

COPY backend/api/ ./api/
COPY backend/wsgi.py ./

ENV PYTHONUNBUFFERED=1
ENV PORT=10000

EXPOSE 10000

CMD gunicorn wsgi:application \
    --workers 2 \
    --worker-class sync \
    --timeout 120 \
    --access-logfile - \
    --error-logfile - \
    --log-level info \
    --bind 0.0.0.0:${PORT}
