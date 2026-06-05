# AgroWeather Nyeri 🌱

A full-stack weather intelligence dashboard built for Central Kenya farmers, powered by the [WeatherAI API](https://weather-ai.co).

Built as a technical challenge submission demonstrating API integration, clean architecture, and local agricultural context.

---

## Features

- **Live Weather Dashboard** — real-time conditions for Nyeri, Kenya with temperature, humidity, wind speed, and feels-like
- **7-Day Forecast** — daily outlook with weather icons and min/max temperatures
- **AI Farming Advice** — Gemini-powered summaries with crop-specific recommendations
- **Tree Canopy Scanner** — upload aerial/drone farm images for AI-powered tree count, canopy coverage, and health analysis
- **Swahili Language Toggle** — full English/Swahili i18n support
- **Auto Location Detection** — IP-based geo lookup defaulting to Nyeri coordinates

---

## Tech Stack

**Backend**
- Python 3.12 + FastAPI
- httpx for async HTTP
- Pydantic v2 for data validation
- Uvicorn ASGI server

**Frontend**
- React 18 + TypeScript
- Vite
- Tailwind CSS v4
- i18next for internationalization
- Axios

**Infrastructure**
- Docker + docker-compose
- Nginx (frontend serving + API proxy)
- Backend deployable to Render/Railway
- Frontend deployable to Vercel

---


## Project Structure

```
agroweather/
├── backend/
│   ├── app/
│   │   ├── api/v1/endpoints/   # weather.py, trees.py
│   │   ├── core/               # config, logging, exceptions
│   │   ├── services/           # http_client, weather, trees
│   │   ├── schemas/            # pydantic response models
│   │   └── main.py
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── api/                # client, weather, trees
│   │   ├── components/         # TreeScanner
│   │   ├── i18n/               # English + Swahili translations
│   │   └── App.tsx
│   ├── Dockerfile
│   └── nginx.conf
└── docker-compose.yml
```

---

## Local Setup

### Prerequisites
- Python 3.12
- Node.js 20+
- Docker Desktop (optional)
- WeatherAI API key from [weather-ai.co](https://weather-ai.co)

### Backend

```bash
cd backend
py -3.12 -m venv .venv
.venv\Scripts\activate        # Windows
source .venv/bin/activate     # Mac/Linux

pip install -r requirements.txt

cp .env.example .env
# Add your WEATHER_AI_API_KEY to .env

uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

API docs available at `http://localhost:8000/docs`

### Frontend

```bash
cd frontend
npm install

cp .env.example .env
# VITE_API_BASE_URL=http://localhost:8000

npm run dev
```

App available at `http://localhost:5173`

### Docker (both services)

```bash
docker-compose up --build
```

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:8000`

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/weather/current` | Current weather for Nyeri |
| GET | `/api/v1/weather/forecast` | 7-day forecast |
| GET | `/api/v1/weather/location` | IP-based location detection |
| POST | `/api/v1/trees/analyze` | Tree canopy analysis from image |
| GET | `/health` | Health check |

---

## Environment Variables

### Backend (`backend/.env`)

```env
WEATHER_AI_API_KEY=wai_your_key_here
WEATHER_AI_BASE_URL=https://api.weather-ai.co
APP_NAME=AgroWeather Nyeri
APP_ENV=development
```

### Frontend (`frontend/.env`)

```env
VITE_API_BASE_URL=http://localhost:8000
```

---

## Live Demo

- **Frontend:** [your-vercel-url.vercel.app](#)
- **Backend API:** [your-render-url.onrender.com/docs](#)

---

## Author

Vincent — Built for the WeatherAI Technical Challenge