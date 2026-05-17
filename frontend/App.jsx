import React, { useState } from 'react';
import { 
  BarChart3, Upload, TrendingUp, Users, 
  Calendar, Package, FileText, ArrowRight, 
  Loader2, AlertCircle 
} from 'lucide-react';
import Markdown from 'react-markdown';

// Mock UI implementation for hackathon submission
const App = () => {
  const [report, setReport] = useState(null);
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('http://localhost:8080/analyze', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Gagal menganalisa data.');

      const data = await response.json();
      setMetrics(data.metrics);
      setReport(data.report);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      <nav className="bg-[#0F172A] text-white p-6 shadow-lg">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart3 className="text-[#10B981]" />
            <span className="text-xl font-bold">AnI Buddy</span>
          </div>
          <span className="text-xs uppercase tracking-widest text-slate-400">UMKM Data Analyst</span>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto p-8">
        {!metrics && !loading && (
          <div className="bg-white border-2 border-dashed border-slate-200 rounded-3xl p-20 text-center">
            <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Upload className="text-slate-400" size={32} />
            </div>
            <h2 className="text-2xl font-bold mb-4">Mulai Analisa Bisnis Anda</h2>
            <p className="text-slate-500 mb-8 max-w-md mx-auto">
              Unggah file CSV penjualan (tanggal, nama_produk, jumlah, harga_total) 
              dan biarkan AI merancang strategi untuk Anda.
            </p>
            <input 
              type="file" 
              id="csv-upload" 
              className="hidden" 
              onChange={handleFileUpload} 
              accept=".csv"
            />
            <label 
              htmlFor="csv-upload"
              className="bg-[#10B981] text-white px-8 py-4 rounded-xl font-bold cursor-pointer hover:bg-[#059669] transition-all"
            >
              Pilih File CSV
            </label>
          </div>
        )}

        {loading && (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="animate-spin text-[#10B981] mb-6" size={48} />
            <p className="text-xl font-semibold">Sedang Mengolah Data Bisnis...</p>
          </div>
        )}

        {metrics && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <MetricCard icon={<TrendingUp className="text-emerald-500"/>} label="Revenue" value={metrics.totalRevenue} isCurrency />
            <MetricCard icon={<Users className="text-blue-500"/>} label="Transaksi" value={metrics.totalTransactions} />
            <MetricCard icon={<Calendar className="text-amber-500"/>} label="Hari Teramai" value={metrics.busiestDay} />
            <MetricCard icon={<Package className="text-purple-500"/>} label="Produk Terlaris" value={metrics.topProducts[0]?.nama_produk} />
          </div>
        )}

        {report && (
          <div className="bg-white rounded-3xl p-10 shadow-sm border border-slate-100 prose max-w-none">
            <div className="flex items-center gap-2 mb-8 border-b pb-4">
              <FileText className="text-[#10B981]" />
              <h2 className="text-xl font-bold m-0 text-[#0F172A]">Laporan Strategis Pro</h2>
            </div>
            <Markdown>{report}</Markdown>
          </div>
        )}
      </main>
    </div>
  );
};

const MetricCard = ({ icon, label, value, isCurrency }) => (
  <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
    <div className="flex items-center gap-2 mb-4">
      {icon}
      <span className="text-xs font-bold text-slate-400 uppercase">{label}</span>
    </div>
    <p className="text-xl font-bold truncate">
      {isCurrency ? `Rp${value.toLocaleString()}` : value}
    </p>
  </div>
);

export default App;
