FROM python:3.11-slim
WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates \
    ffmpeg \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

COPY api/ ./api/
COPY wsgi.py ./

RUN mkdir -p /var/data/tmp/user_data /var/data/tmp/yt-dlp-cache

ENV PYTHONUNBUFFERED=1
ENV TMP_DIR=/var/data/tmp
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
