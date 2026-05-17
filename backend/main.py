import os
import io
import pandas as pd
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="AnI Buddy API")

# CORS Middleware for React Integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Gemini Configuration
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
model = genai.GenerativeModel('gemini-1.5-flash')

@app.post("/analyze")
async def analyze_sales(file: UploadFile = File(...)):
    try:
        # 1. Bronze Layer (Ingestion)
        contents = await file.read()
        filename = file.filename.lower()
        
        if filename.endswith('.csv'):
            df = pd.read_csv(io.BytesIO(contents))
        elif filename.endswith(('.xlsx', '.xls')):
            df = pd.read_excel(io.BytesIO(contents))
        else:
            raise HTTPException(status_code=400, detail="Unsupported file format. Please upload CSV or Excel.")

        # 2. Silver Layer (Cleaning)
        # Standardize column names
        df.columns = [str(c).strip().lower() for c in df.columns]
        
        # Mapping common variations to our internal keys
        col_mapping = {
            'tanggal': 'tanggal',
            'date': 'tanggal',
            'nama_produk': 'nama_produk',
            'product_name': 'nama_produk',
            'produk': 'nama_produk',
            'jumlah': 'jumlah',
            'qty': 'jumlah',
            'quantity': 'jumlah',
            'harga_total': 'harga_total',
            'total_price': 'harga_total',
            'revenue': 'harga_total'
        }
        
        # Rename columns if matches found
        new_cols = {}
        for c in df.columns:
            if c in col_mapping:
                new_cols[c] = col_mapping[c]
        df = df.rename(columns=new_cols)

        required_cols = ['tanggal', 'nama_produk', 'jumlah', 'harga_total']
        missing = [c for c in required_cols if c not in df.columns]
        if missing:
            raise HTTPException(status_code=400, detail=f"Missing required data columns: {', '.join(missing)}")

        # Start Cleaning
        df = df[required_cols].copy()
        
        # Clean nama_produk: strip, title case for normalization
        df['nama_produk'] = df['nama_produk'].astype(str).str.strip().str.title()
        
        # Clean harga_total: handle "Rp", dots, commas
        def clean_numeric(val):
            if pd.isna(val): return None
            s = str(val).lower()
            s = s.replace('rp', '').replace(' ', '').replace(',', '')
            # If there's a dot, often it's a thousands separator in IDR context if it's followed by 3 digits
            # But standard numeric conversion might treat it as decimal.
            # However, for UMKM data usually it's plain numbers.
            # We'll try to convert directly first.
            try:
                return float(s)
            except:
                return None

        df['harga_total'] = df['harga_total'].apply(clean_numeric)
        df['jumlah'] = df['jumlah'].apply(clean_numeric)
        
        # Drop rows with critical nulls
        df = df.dropna(subset=['tanggal', 'nama_produk', 'harga_total'])
        
        # Handle jumlah: default to 1 if missing, ensure positive
        df['jumlah'] = df['jumlah'].fillna(1).apply(lambda x: abs(float(x)))
        df['harga_total'] = df['harga_total'].apply(lambda x: abs(float(x)))

        # Clean tanggal: handle multiple formats
        df['tanggal_dt'] = pd.to_datetime(df['tanggal'], errors='coerce', dayfirst=True)
        # Drop rows where date is still invalid
        df = df.dropna(subset=['tanggal_dt'])
        # Sort by date
        df = df.sort_values(by='tanggal_dt')
        
        # Formatted date for frontend
        df['tanggal'] = df['tanggal_dt'].dt.strftime('%Y-%m-%d')

        # 3. Gold Layer (Aggregation)
        total_revenue = float(df['harga_total'].sum())
        total_transactions = int(len(df))
        
        # Top 3 Products
        top_products_df = df.groupby('nama_produk').agg({
            'jumlah': 'sum',
            'harga_total': 'sum'
        }).sort_values(by='harga_total', ascending=False).head(3).reset_index()
        
        top_products = top_products_df.to_dict('records')
        
        # Busiest Day
        busiest_day = df['tanggal_dt'].dt.date.value_counts().idxmax().strftime('%Y-%m-%d')
        
        # Sales Trend (by day)
        trend_df = df.groupby('tanggal').agg({
            'harga_total': 'sum',
            'nama_produk': 'count'
        }).rename(columns={'harga_total': 'revenue', 'nama_produk': 'transactions'}).reset_index()
        trend_df = trend_df.rename(columns={'tanggal': 'date'})
        sales_trend = trend_df.to_dict('records')

        # Product Distribution
        dist_df = df.groupby('nama_produk').size().reset_index(name='value')
        # Rename for pie chart
        dist_df = dist_df.rename(columns={'nama_produk': 'name'})
        product_distribution = dist_df.to_dict('records')

        gold_metrics = {
            "totalRevenue": total_revenue,
            "totalTransactions": total_transactions,
            "topProducts": top_products,
            "busiestDay": busiest_day,
            "averageTransactionValue": total_revenue / total_transactions if total_transactions > 0 else 0,
            "salesTrend": sales_trend,
            "productDistribution": product_distribution
        }

        # Raw data for table (converted back to records)
        raw_records = df[required_cols].to_dict('records')

        return {
            "metrics": gold_metrics,
            "rawData": raw_records
        }

    except Exception as e:
        print(f"Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8080)
