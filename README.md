# AnI Buddy - AI Data Analyst for Anybody 🇮🇩

AnI Buddy (An Insight Buddy) adalah solusi analitik berbasis AI yang dirancang khusus untuk membantu pelaku bisnis pemula maupun profesional di Indonesia memahami data penjualan mereka tanpa perlu menjadi ahli data. Cocok digunakan oleh siapa saja (Anybody).

## Fitur Utama
- **Medallion Architecture**: Pemrosesan data yang terstruktur melalui layer Bronze (Ingestion), Silver (Cleaning), dan Gold (Aggregation).
- **Agentic AI**: Menggunakan Google Gemini-1.5-Flash untuk memberikan saran bisnis strategis dan empatik.
- **Modern UI**: Dashboard yang bersih dan responsif dengan tema Deep Navy & Emerald Green.

## Cara Menjalankan Lokal

### Backend (FastAPI)
1. Masuk ke folder backend: `cd backend`
2. Buat virtual environment: `python -m venv venv`
3. Aktifkan venv: `source venv/bin/activate` (Mac/Linux) atau `venv\Scripts\activate` (Windows)
4. Instal dependensi: `pip install -r requirements.txt`
5. Masukkan API Key di `.env`: `GEMINI_API_KEY=your_key_here`
6. Jalankan server: `uvicorn main:app --reload --port 8080`

### Frontend (React)
1. Masuk ke folder frontend: `cd frontend`
2. Instal dependensi: `npm install`
3. Jalankan aplikasi: `npm run dev`

## Cara Deploy ke Google Cloud Run

Gunakan perintah gcloud berikut untuk mendeploy backend:

```bash
gcloud run deploy smart-boss-backend \
  --source ./backend \
  --region asia-southeast1 \
  --set-env-vars GEMINI_API_KEY=YOUR_API_KEY \
  --allow-unauthenticated
```
