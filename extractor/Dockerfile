FROM python:3.12-slim

ENV PYTHONUNBUFFERED=1 \
    PORT=8790

WORKDIR /app

COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

COPY main.py ./

EXPOSE 8790
CMD ["sh", "-c", "uvicorn main:app --host 0.0.0.0 --port ${PORT}"]
