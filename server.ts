import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import multer from "multer";
import { parse as parseCsv } from "csv-parse/sync";
import * as XLSX from "xlsx";
import { parse as parseDate, isValid, format } from "date-fns";
import type { SalesRecord, BusinessMetrics } from "./src/types";

const app = express();
const PORT = 3000;
const upload = multer({ storage: multer.memoryStorage() });

// Middleware
app.use(express.json());

// --- Helper Functions ---

/**
 * Robust date parsing for common Indonesian and international formats.
 */
function robustParseDate(dateStr: string): Date | null {
  if (!dateStr) return null;
  
  // Try standard ISO/JS parsing first
  const date = new Date(dateStr);
  if (isValid(date)) return date;

  // Try some common formats
  const formats = [
    "dd/MM/yyyy", "dd-MM-yyyy", "yyyy-MM-dd", "MM/dd/yyyy",
    "d/M/yyyy", "d-M-yyyy", "yyyy/MM/dd"
  ];

  for (const fmt of formats) {
    const parsed = parseDate(dateStr, fmt, new Date());
    if (isValid(parsed)) return parsed;
  }

  return null;
}

// --- Medallion Architecture Logic ---

function normalizeProductName(name: string): string {
  if (!name || String(name).trim() === "") return "Produk Tanpa Nama";
  return String(name)
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

/**
 * Parses numbers including word-based integers (Indonesian) and currency strings.
 */
function parseNumber(val: any): number {
  if (typeof val === "number") return val;
  if (!val) return 0;
  
  const str = String(val).trim().toLowerCase();
  
  // Handle common word numbers (Indonesian)
  const wordMap: Record<string, number> = {
    "satu": 1, "dua": 2, "tiga": 3, "empat": 4, "lima": 5,
    "enam": 6, "tujuh": 7, "delapan": 8, "sembilan": 9, "sepuluh": 10
  };
  
  if (wordMap[str]) return wordMap[str];

  // Clean currency and thousands separators
  // Handles "Rp 10.000", "10,000", etc.
  const cleaned = str
    .replace(/rp/g, "")
    .replace(/\s/g, "")
    .replace(/\./g, "") // Remove thousands separator
    .replace(",", "."); // Convert decimal comma to dot
    
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : Math.abs(num); // Ensure positive
}

function processSilver(records: any[]): SalesRecord[] {
  // Pass 1: Extraction & Basic Normalization
  const extractedRows = records.map((r) => {
    const findKey = (variations: string[]) => {
      const key = Object.keys(r).find(k => 
        variations.some(v => k.toLowerCase().replace(/[^a-z]/g, "") === v.toLowerCase().replace(/[^a-z]/g, ""))
      );
      return key ? r[key] : null;
    };

    const tanggalRaw = findKey(["tanggal", "date", "waktu", "time"]);
    const namaProdukRaw = findKey(["namaproduk", "produk", "item", "product", "nama"]);
    const jumlahRaw = findKey(["jumlah", "qty", "quantity", "unit", "volume"]);
    const hargaTotalRaw = findKey(["hargatotal", "total", "revenue", "subtotal", "amount"]);

    let dateObj = robustParseDate(String(tanggalRaw));
    if (!dateObj) dateObj = new Date(); // Impute missing date as "Today"
    
    const cleanProductName = normalizeProductName(String(namaProdukRaw || ""));
    const cleanJumlah = parseNumber(jumlahRaw);
    const cleanHargaTotal = parseNumber(hargaTotalRaw);

    return {
      tanggal: format(dateObj, "yyyy-MM-dd"),
      dateObj: dateObj,
      nama_produk: cleanProductName,
      jumlah: cleanJumlah,
      harga_total: cleanHargaTotal,
    };
  });

  // Pass 2: Unit Price Discovery (Silver Intelligence)
  // We collect all VALID unit prices for each normalized product name
  const productKnowledge: Record<string, number[]> = {};
  extractedRows.forEach(row => {
    if (row.nama_produk !== "Produk Tanpa Nama" && row.jumlah > 0 && row.harga_total > 0) {
      const unitPrice = row.harga_total / row.jumlah;
      if (!productKnowledge[row.nama_produk]) productKnowledge[row.nama_produk] = [];
      productKnowledge[row.nama_produk].push(unitPrice);
    }
  });

  // Calculate "Trusted" Unit Price (Simple Mean for this implementation)
  const trustedPrices: Record<string, number> = {};
  Object.entries(productKnowledge).forEach(([product, prices]) => {
    trustedPrices[product] = prices.reduce((a, b) => a + b, 0) / prices.length;
  });

  // Pass 3: Imputation & Final Cleaning
  return extractedRows
    .map(row => {
      const unitPrice = trustedPrices[row.nama_produk];

      // Fix missing Harga Total if we have Jumlah and know the price
      if (row.harga_total === 0 && row.jumlah > 0 && unitPrice) {
        row.harga_total = row.jumlah * unitPrice;
      }
      
      // Fix missing Jumlah if we have Total and know the price
      if (row.jumlah === 0 && row.harga_total > 0 && unitPrice) {
        row.jumlah = Math.round(row.harga_total / unitPrice);
      }

      // Final fallback: if both missing but product name exists, assume 1 unit at trusted price
      if (row.jumlah === 0 && row.harga_total === 0 && unitPrice) {
        row.jumlah = 1;
        row.harga_total = unitPrice;
      }

      return row;
    })
    // Filter out rows that are completely unsalvageable
    .filter(r => r.nama_produk !== "Produk Tanpa Nama" && (r.jumlah > 0 || r.harga_total > 0));
}

function processGold(records: any[]): BusinessMetrics {
  const totalRevenue = records.reduce((sum, r) => sum + r.harga_total, 0);
  const totalTransactions = records.length;
  
  // Product aggregation
  const productMap: Record<string, { quantity: number; revenue: number }> = {};
  records.forEach((r) => {
    if (!productMap[r.nama_produk]) {
      productMap[r.nama_produk] = { quantity: 0, revenue: 0 };
    }
    productMap[r.nama_produk].quantity += r.jumlah;
    productMap[r.nama_produk].revenue += r.harga_total;
  });

  const sortedProducts = Object.entries(productMap)
    .map(([name, stats]) => ({ name, ...stats }))
    .sort((a, b) => b.revenue - a.revenue);

  const topProducts = sortedProducts.slice(0, 3);
  const productDistribution = sortedProducts.map(p => ({ name: p.name, value: p.quantity }));

  // Sort records by date for accurate trend analysis
  const sortedRecords = [...records].sort((a, b) => a.dateObj.getTime() - b.dateObj.getTime());

  const minDate = sortedRecords[0].dateObj;
  const maxDate = sortedRecords[sortedRecords.length - 1].dateObj;
  const diffDays = Math.ceil((maxDate.getTime() - minDate.getTime()) / (1000 * 60 * 60 * 24));

  let groupKey = (d: Date) => format(d, "yyyy-MM-dd"); // Default Daily
  
  if (diffDays > 60) {
    // Monthly
    groupKey = (d: Date) => format(d, "yyyy-MM");
  } else if (diffDays >= 14) {
    // Weekly
    groupKey = (d: Date) => `${format(d, "yyyy")}-W${format(d, "II")}`;
  }

  const trendMap: Record<string, { revenue: number; transactions: number }> = {};
  records.forEach((r) => {
    const key = groupKey(r.dateObj);
    if (!trendMap[key]) {
      trendMap[key] = { revenue: 0, transactions: 0 };
    }
    trendMap[key].revenue += r.harga_total;
    trendMap[key].transactions += 1;
  });

  const salesTrend = Object.entries(trendMap)
    .map(([date, stats]) => ({ date, ...stats }))
    .sort((a, b) => a.date.localeCompare(b.date));

  const busiestDay = Object.entries(trendMap).sort((a, b) => b[1].transactions - a[1].transactions)[0]?.[0] || "N/A";

  return {
    totalRevenue,
    totalTransactions,
    topProducts,
    productDistribution,
    salesTrend,
    busiestDay,
    averageTransactionValue: totalTransactions > 0 ? totalRevenue / totalTransactions : 0,
  };
}

// API Routes
app.post("/api/analyze", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    let rawRecords: any[] = [];
    const fileExtension = path.extname(req.file.originalname).toLowerCase();

    if (fileExtension === ".csv") {
      rawRecords = parseCsv(req.file.buffer, {
        columns: true,
        skip_empty_lines: true,
        trim: true,
      });
    } else if (fileExtension === ".xlsx" || fileExtension === ".xls") {
      const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      rawRecords = XLSX.utils.sheet_to_json(worksheet);
    } else {
      return res.status(400).json({ error: "Unsupported file format. Please upload CSV or Excel file." });
    }

    // Silver Layer: Cleaning
    const silverData = processSilver(rawRecords);

    if (silverData.length === 0) {
      return res.status(400).json({ 
        error: "No valid data found. Check your columns. Required: tanggal, nama_produk, jumlah, harga_total." 
      });
    }

    // Gold Layer: Aggregation
    const metrics = processGold(silverData);

    // Filter out dateObj for response
    const finalData = silverData.map(({ dateObj, ...rest }) => rest);

    res.json({
      metrics,
      rawData: finalData,
    });
  } catch (error: any) {
    console.error("Analysis error:", error);
    res.status(500).json({ 
      error: `Failed to process data: ${error.message || "Unknown error"}. Ensure the file format is correct (CSV/Excel).` 
    });
  }
});

// Vite Middleware for Dev, Serving for Prod
async function start() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`AnI Buddy Server listening at http://localhost:${PORT}`);
  });
}

start();
