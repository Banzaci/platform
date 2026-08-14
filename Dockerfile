FROM python:3.12-slim

WORKDIR /app

# Systemberoenden för spaCy
RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# App-kod
COPY ./app ./app

# NLP-modell och predict-script
COPY ./nlp ./nlp

EXPOSE 8000

# Ta bort --reload i produktion
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]