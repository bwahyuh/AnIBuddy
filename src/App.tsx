import { useState, useRef, useEffect, useMemo } from "react";
import Papa from "papaparse";
import * as XLSX from "xlsx";
import { 
  BarChart3, 
  Upload, 
  TrendingUp, 
  Calendar, 
  Package, 
  FileText,
  AlertCircle,
  Loader2,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Globe,
  Zap,
  Menu,
  X,
  Table as TableIcon,
  ChevronLeft,
  ChevronRight,
  Search,
  Database,
  Lock,
  Server,
  AlertTriangle,
  Save,
  Trash2,
  Bot
} from "lucide-react";
import { motion, AnimatePresence, useScroll, useTransform } from "motion/react";
import Markdown from "react-markdown";
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  Cell, 
  PieChart, 
  Pie, 
  Legend,
  ComposedChart,
  Area
} from "recharts";
import { generateStrategicInsights } from "./services/geminiService";
import type { BusinessMetrics, SalesRecord } from "./types";
import { cn } from "./lib/utils";

// --- Components ---

const Navbar = ({ onStart, onNav, isLanding }: { onStart: () => void, onNav: (v: any) => void, isLanding: boolean }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <nav className={cn(
      "fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-12 py-6 md:py-8 transition-all duration-500",
      isLanding ? "bg-black/30 backdrop-blur-2xl border-b border-white/10" : "bg-white border-b border-slate-100/50 shadow-[0_1px_40px_rgba(0,0,0,0.02)]"
    )}>
      <div className="flex items-center gap-3 group cursor-pointer" onClick={() => onNav("landing")}>
        <div className={cn(
          "w-11 h-11 flex items-center justify-center rounded-2xl shadow-[0_10px_30px_rgba(20,184,166,0.3)] group-hover:scale-110 transition-all duration-500", 
          isLanding ? "bg-brand-accent" : "bg-brand-navy"
        )}>
          <Bot size={24} className="text-white" />
        </div>
        <span className={cn("text-2xl font-display font-bold tracking-tight", isLanding ? "text-white" : "text-brand-navy")}>
          AnI <span className="text-brand-accent">Buddy</span>
        </span>
      </div>

      {/* Desktop Nav */}
      <div className="hidden md:flex items-center gap-12">
        <button onClick={() => onNav("features")} className={cn("text-sm font-semibold tracking-wide hover:text-brand-accent transition-colors", isLanding ? "text-white font-bold" : "text-slate-500")}>Fitur Utama</button>
        <button onClick={() => onNav("security")} className={cn("text-sm font-semibold tracking-wide hover:text-brand-accent transition-colors", isLanding ? "text-white font-bold" : "text-slate-500")}>Keamanan Data</button>
        <button 
          onClick={onStart}
          className="bg-brand-accent text-white px-10 py-3.5 rounded-full font-bold shadow-[0_12px_40px_rgba(20,184,166,0.25)] hover:bg-[#0d9488] hover:-translate-y-1 transition-all active:scale-95"
        >
          Masuk Dashboard
        </button>
      </div>

      <button className={cn("md:hidden", isLanding ? "text-white" : "text-brand-navy")} onClick={() => setIsOpen(!isOpen)}>
        {isOpen ? <X size={32} /> : <Menu size={32} />}
      </button>

      {/* Mobile Nav */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="absolute top-24 left-6 right-6 bg-white rounded-[2.5rem] border border-slate-100 p-10 flex flex-col gap-8 shadow-2xl md:hidden"
          >
            <button onClick={() => { onNav("features"); setIsOpen(false); }} className="text-xl font-display font-bold text-slate-900 border-b border-slate-50 pb-4 text-left">Fitur</button>
            <button onClick={() => { onNav("security"); setIsOpen(false); }} className="text-xl font-display font-bold text-slate-900 border-b border-slate-50 pb-4 text-left">Keamanan</button>
            <button onClick={() => { onStart(); setIsOpen(false); }} className="bg-brand-accent text-white py-5 rounded-3xl font-bold text-lg">Mulai Sekarang</button>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

const FeatureCard = ({ icon: Icon, title, desc }: { icon: any, title: string, desc: string }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    className="p-8 md:p-12 rounded-[2.5rem] md:rounded-[3.5rem] bg-white border border-slate-50 shadow-[0_20px_80px_rgba(0,0,0,0.02)] flex flex-col items-center text-center group transition-all duration-700 hover:shadow-[0_60px_100px_rgba(0,0,0,0.08)] hover:-translate-y-2"
  >
    <div className="bg-slate-50 p-6 md:p-8 rounded-[1.5rem] md:rounded-[2rem] mb-6 md:mb-10 group-hover:bg-brand-accent group-hover:text-white transition-all duration-700">
      <Icon size={32} className="text-slate-300 md:size-[40px] group-hover:text-white transition-all duration-700" />
    </div>
    <h3 className="text-xl md:text-2xl font-display font-bold text-brand-navy mb-4 md:mb-5">{title}</h3>
    <p className="text-sm md:text-base text-slate-400 leading-relaxed font-medium">{desc}</p>
  </motion.div>
);

const GlobalFooter = ({ onNav }: { onNav: (v: any) => void }) => (
  <footer className="py-12 md:py-16 px-6 bg-white border-t border-slate-50">
    <div className="max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-12 mb-12">
        <div className="flex flex-col items-center md:items-start text-center md:text-left">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-11 h-11 flex items-center justify-center bg-brand-navy rounded-xl">
              <Bot size={24} className="text-white" />
            </div>
            <span className="text-2xl font-display font-bold text-brand-navy">AnI <span className="text-brand-accent">Buddy</span></span>
          </div>
          <p className="text-slate-400 max-w-xs font-medium text-sm leading-relaxed">
            Platform kecerdasan bisnis nomor satu untuk membantu UMKM tumbuh lebih cepat dengan data.
          </p>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-12 gap-y-10 w-full md:w-auto">
          <div className="flex flex-col gap-4 text-center sm:text-left">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-300">Product</span>
            <div className="flex flex-col gap-3">
              <button onClick={() => onNav("features")} className="text-sm font-bold text-brand-navy hover:text-brand-accent transition-colors text-center sm:text-left">Features</button>
              <button onClick={() => onNav("security")} className="text-sm font-bold text-brand-navy hover:text-brand-accent transition-colors text-center sm:text-left">Security</button>
            </div>
          </div>
          <div className="flex flex-col gap-4 text-center sm:text-left">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-300">Social</span>
            <div className="flex flex-col gap-3">
              <a href="https://www.linkedin.com/in/bagas-wahyu-herdiansyah/" target="_blank" rel="noopener noreferrer" className="text-sm font-bold text-brand-navy hover:text-brand-accent transition-colors text-center sm:text-left">LinkedIn</a>
            </div>
          </div>
          <div className="flex flex-col gap-4 text-center sm:text-left col-span-2 sm:col-span-1">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-300">Legal</span>
            <div className="flex flex-col gap-3">
              <button onClick={() => onNav("privacy")} className="text-sm font-bold text-brand-navy hover:text-brand-accent transition-colors text-center sm:text-left">Privacy</button>
              <button onClick={() => onNav("terms")} className="text-sm font-bold text-brand-navy hover:text-brand-accent transition-colors text-center sm:text-left">Terms</button>
            </div>
          </div>
        </div>
      </div>
      <div className="pt-8 border-t border-slate-50 flex flex-col md:flex-row items-center justify-between gap-6">
        <p className="text-[10px] font-bold text-slate-300 uppercase tracking-[0.3em]">© 2026 #JuaraVibeCoding</p>
        <div className="flex gap-8">
           <span className="text-[10px] font-bold text-slate-300 uppercase tracking-[0.2em]">Designed with Love</span>
        </div>
      </div>
    </div>
  </footer>
);

const FeaturesPage = ({ onStart, onNav }: { onStart: () => void, onNav: (v: any) => void }) => (
  <div className="min-h-screen bg-[#fafbfc]">
    <Navbar onStart={onStart} onNav={onNav} isLanding={false} />
    <main className="max-w-7xl mx-auto px-6 md:px-12 pt-40 pb-32">
      <motion.header 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="mb-24 text-center"
      >
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-teal-50 text-brand-accent text-[10px] font-bold uppercase tracking-widest border border-teal-100 mb-8">
          <Zap size={14} />
          Enterprise Engine for UMKM
        </div>
        <h1 className="text-4xl md:text-7xl font-display font-bold text-brand-navy mb-8 tracking-tighter leading-tight">Arsitektur Data <br /> Kelas Dunia.</h1>
        <p className="text-base md:text-xl text-slate-400 max-w-2xl mx-auto font-medium">Kami membangun AnI Buddy dengan infrastruktur yang sama seperti korporasi raksasa, kini dapat diakses oleh bisnis Anda.</p>
      </motion.header>

      <motion.section 
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8 }}
        className="mb-32"
      >
        <div className="flex items-center justify-center md:justify-start gap-4 mb-12">
          <div className="bg-brand-navy p-3 rounded-2xl">
            <Database size={24} className="text-white" />
          </div>
          <div className="text-center md:text-left">
            <h3 className="text-2xl font-display font-bold text-brand-navy">Medallion Data Pipeline</h3>
            <p className="text-sm text-slate-400">Teknologi transformasi data 3 lapis untuk akurasi maksimal.</p>
          </div>
        </div>
        <DataPipelineVisual />
      </motion.section>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 pt-16 border-t border-slate-100">
        <motion.div 
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="p-8 md:p-16 rounded-[2.5rem] md:rounded-[4rem] bg-white border border-slate-50 premium-shadow"
        >
           <Globe size={48} className="text-brand-accent mb-10" />
           <h3 className="text-2xl md:text-3xl font-display font-bold text-brand-navy mb-6">Akses Global Real-Time</h3>
           <p className="text-slate-500 leading-relaxed text-base md:text-lg mb-8">Pantau performa bisnis Anda dari mana saja di seluruh dunia. Selama Anda memiliki koneksi internet, Command Center Anda selalu dalam jangkauan.</p>
           <ul className="space-y-4">
             <li className="flex items-center gap-3 text-sm font-bold text-slate-400">
               <div className="w-1.5 h-1.5 rounded-full bg-teal-500" />
               Zero Down Time
             </li>
             <li className="flex items-center gap-3 text-sm font-bold text-slate-400">
               <div className="w-1.5 h-1.5 rounded-full bg-teal-500" />
               Low-Latency Data Fetching
             </li>
           </ul>
        </motion.div>
        <motion.div 
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="p-8 md:p-16 rounded-[2.5rem] md:rounded-[4rem] bg-brand-navy text-white shadow-2xl shadow-slate-900/40"
        >
           <ShieldCheck size={48} className="text-brand-accent mb-10" />
           <h3 className="text-2xl md:text-3xl font-display font-bold mb-6 text-white">Enkripsi Tingkat Tinggi</h3>
           <p className="text-slate-300/80 leading-relaxed text-base md:text-lg mb-8">Setiap byte data yang Anda unggah dilindungi oleh standar enkripsi perbankan internasional sebelum diproses oleh AI.</p>
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="p-6 rounded-3xl bg-white/5 border border-white/10">
                <h4 className="text-[10px] font-bold uppercase tracking-widest text-brand-accent mb-2">Algorithm</h4>
                <p className="text-sm font-bold">AES-256 GCM</p>
              </div>
              <div className="p-6 rounded-3xl bg-white/5 border border-white/10">
                <h4 className="text-[10px] font-bold uppercase tracking-widest text-brand-accent mb-2">Protocol</h4>
                <p className="text-sm font-bold">TLS 1.3 Secure</p>
              </div>
           </div>
        </motion.div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 1 }}
        className="mt-32 text-center bg-white p-12 md:p-20 rounded-[2.5rem] md:rounded-[4rem] border border-slate-50 premium-shadow"
      >
        <h3 className="text-2xl md:text-4xl font-display font-bold text-brand-navy mb-6">Siap Menjadi Pemimpin Pasar?</h3>
        <p className="text-slate-400 max-w-xl mx-auto mb-12 font-medium">Buktikan sendiri bagaimana arsitektur data canggih kami merubah cara Anda mengambil keputusan bisnis.</p>
        <button 
          onClick={onStart} 
          className="w-full sm:w-auto bg-brand-navy text-white px-12 md:px-20 py-5 md:py-6 rounded-full font-bold text-lg md:text-xl hover:bg-brand-accent transition-all hover:-translate-y-2 active:scale-95 shadow-xl"
        >
          Luncurkan Dashboard Saya
        </button>
      </motion.div>
    </main>
    <GlobalFooter onNav={onNav} />
  </div>
);

const SecurityPage = ({ onStart, onNav }: { onStart: () => void, onNav: (v: any) => void }) => (
  <div className="min-h-screen bg-[#020617] text-white">
    <Navbar onStart={onStart} onNav={onNav} isLanding={true} />
    
    <main className="max-w-7xl mx-auto px-6 md:px-12 pt-40 pb-32">
      {/* Header */}
      <div className="max-w-3xl mb-24">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-teal-500/10 text-brand-accent text-[10px] font-bold uppercase tracking-widest border border-teal-500/20 mb-8">
            <Lock size={14} />
            Enterprise Security Standard
          </div>
          <h1 className="text-4xl md:text-7xl font-display font-bold mb-8 tracking-tighter leading-tight">
            Benchmark Utama : <br />
            <span className="text-brand-accent">Keamanan & Kepercayaan.</span>
          </h1>
          <p className="text-lg md:text-xl text-slate-400 leading-relaxed font-medium">
            Data bisnis Anda adalah aset paling berharga. Kami menggunakan teknologi enkripsi yang setara dengan infrastruktur militer untuk melindunginya.
          </p>
        </motion.div>
      </div>

      {/* Core Pillars */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-32">
        <div className="p-10 rounded-[3rem] bg-white/5 border border-white/10 hover:bg-white/[0.08] transition-all duration-500">
          <div className="w-16 h-16 rounded-2xl bg-brand-accent/20 flex items-center justify-center text-brand-accent mb-8">
            <ShieldCheck size={32} />
          </div>
          <h3 className="text-2xl font-display font-bold mb-4">Zero-Retention</h3>
          <p className="text-slate-400 leading-relaxed">Kami tidak menyimpan data mentah Anda secara permanen. Setelah analisis selesai dan sesi berakhir, data dibersihkan secara otomatis sesuai kebijakan <i>Memory-Wipe</i>.</p>
        </div>

        <div className="p-10 rounded-[3rem] bg-white/5 border border-white/10 hover:bg-white/[0.08] transition-all duration-500">
          <div className="w-16 h-16 rounded-2xl bg-teal-500/20 flex items-center justify-center text-teal-400 mb-8">
            <Database size={32} />
          </div>
          <h3 className="text-2xl font-display font-bold mb-4">Anonymization</h3>
          <p className="text-slate-400 leading-relaxed">Identitas pelanggan dan informasi sensitif diubah menjadi token unik (masking) sebelum diproses oleh algoritma AI untuk menjamin anonimitas total.</p>
        </div>

        <div className="p-10 rounded-[3rem] bg-white/5 border border-white/10 hover:bg-white/[0.08] transition-all duration-500">
          <div className="w-16 h-16 rounded-2xl bg-cyan-500/20 flex items-center justify-center text-cyan-400 mb-8">
            <Server size={32} />
          </div>
          <h3 className="text-2xl font-display font-bold mb-4">Cloud Defense</h3>
          <p className="text-slate-400 leading-relaxed">Dihosting di infrastruktur Google Cloud yang bersertifikasi SOC2/3, ISO 27001, dan HIPAA, memberikan proteksi fisik dan digital kelas dunia.</p>
        </div>
      </div>

      {/* Technical Specs */}
      <div className="bg-white/5 rounded-[4rem] border border-white/10 p-12 md:p-20 relative overflow-hidden">
         <div className="absolute top-0 right-0 w-1/3 h-full bg-brand-accent/5 blur-[120px] pointer-events-none" />
         
         <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
           <div>
             <h2 className="text-3xl md:text-4xl font-display font-bold mb-8">Protokol Teknis Secara Konkrit</h2>
             <div className="space-y-8">
                <div className="flex gap-6">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full border border-teal-500/30 flex items-center justify-center text-brand-accent font-bold">01</div>
                  <div>
                    <h4 className="text-xl font-bold mb-2">TLS 1.3 Transport Encryption</h4>
                    <p className="text-slate-400 text-sm md:text-base">Seluruh jalur data antara perangkat Anda dan server kami menggunakan enkripsi TLS 1.3 terbaru dengan <i>Perfect Forward Secrecy</i> (PFS).</p>
                  </div>
                </div>
                <div className="flex gap-6">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full border border-teal-500/30 flex items-center justify-center text-brand-accent font-bold">02</div>
                  <div>
                    <h4 className="text-xl font-bold mb-2">AES-256 GCM Storage</h4>
                    <p className="text-slate-400 text-sm md:text-base">Data transisi dienkripsi menggunakan standar militer AES-256 (Galois/Counter Mode), satu-satunya metode enkripsi yang diakui secara global untuk data Sangat Rahasia.</p>
                  </div>
                </div>
                <div className="flex gap-6">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full border border-teal-500/30 flex items-center justify-center text-brand-accent font-bold">03</div>
                  <div>
                    <h4 className="text-xl font-bold mb-2">GDPR & PDP Compliance</h4>
                    <p className="text-slate-400 text-sm md:text-base">Sistem kami sepenuhnya patuh terhadap UU Perlindungan Data Pribadi (PDP) Indonesia dan regulasi ketat GDPR Eropa.</p>
                  </div>
                </div>
             </div>
           </div>

           <div className="hidden lg:flex items-center justify-center">
              <div className="relative">
                <div className="absolute inset-0 bg-brand-accent blur-[100px] opacity-20" />
                <motion.div 
                  animate={{ 
                    scale: [1, 1.05, 1],
                    rotate: [0, 5, 0]
                  }}
                  transition={{ duration: 6, repeat: Infinity }}
                  className="relative p-16 rounded-full bg-white/5 border border-white/10"
                >
                  <Lock size={120} className="text-brand-accent opacity-50" />
                </motion.div>
              </div>
           </div>
         </div>
      </div>

      <div className="mt-32 text-center">
         <button 
          onClick={onStart}
          className="w-full sm:w-auto bg-brand-accent text-[#020617] px-12 py-5 rounded-full font-bold text-lg hover:shadow-[0_0_50px_rgba(20,184,166,0.4)] transition-all hover:-translate-y-2 active:scale-95"
        >
          Uji Keamanan & Mulai
        </button>
      </div>
    </main>
    <GlobalFooter onNav={onNav} />
  </div>
);

const PrivacyPage = ({ onNav }: { onNav: (v: any) => void }) => (
  <div className="min-h-screen bg-white">
    <Navbar onStart={() => onNav("dashboard")} onNav={onNav} isLanding={false} />
    <main className="max-w-4xl mx-auto px-6 pt-40 pb-32">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1 className="text-4xl md:text-6xl font-display font-bold text-brand-navy mb-8 tracking-tighter">Kebijakan Privasi</h1>
        <div className="prose prose-slate max-w-none font-medium text-slate-500 leading-relaxed space-y-6">
          <p>Terakhir diperbarui: 12 Mei 2026</p>
          <h2 className="text-2xl font-bold text-brand-navy mt-12">1. Komitmen Privasi Kami</h2>
          <p>AnI Buddy berkomitmen untuk melindungi data bisnis Anda. Kami memahami betapa pentingnya informasi yang Anda percayakan kepada kami.</p>
          
          <h2 className="text-2xl font-bold text-brand-navy mt-8">2. Data yang Kami Proses</h2>
          <p>Kami hanya memproses data yang Anda unggah secara sadar melalui dashboard. Ini termasuk data transaksi penjualan, daftar produk, dan metrik operasional lainnya.</p>
          
          <h2 className="text-2xl font-bold text-brand-navy mt-8">3. Keamanan Data</h2>
          <p>Seluruh data dienkripsi menggunakan standar AES-256 dan dilindungi dengan protokol TLS 1.3 selama transmisi. Kami menerapkan arsitektur Zero-Retention di mana data mentah tidak disimpan secara permanen.</p>
          
          <h2 className="text-2xl font-bold text-brand-navy mt-8">4. Hak Pengguna</h2>
          <p>Anda memiliki hak penuh untuk menghapus data Anda kapan saja melalui fitur "Clear Workspace" di dashboard kami.</p>
        </div>
      </motion.div>
    </main>
    <GlobalFooter onNav={onNav} />
  </div>
);

const TermsPage = ({ onNav }: { onNav: (v: any) => void }) => (
  <div className="min-h-screen bg-white">
    <Navbar onStart={() => onNav("dashboard")} onNav={onNav} isLanding={false} />
    <main className="max-w-4xl mx-auto px-6 pt-40 pb-32">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1 className="text-4xl md:text-6xl font-display font-bold text-brand-navy mb-8 tracking-tighter">Syarat & Ketentuan</h1>
        <div className="prose prose-slate max-w-none font-medium text-slate-500 leading-relaxed space-y-6">
          <p>Terakhir diperbarui: 12 Mei 2026</p>
          <h2 className="text-2xl font-bold text-brand-navy mt-12">1. Penggunaan Layanan</h2>
          <p>Dengan menggunakan AnI Buddy, Anda setuju untuk mematuhi ketentuan penggunaan ini. Layanan ini disediakan untuk membantu analisis bisnis.</p>
          
          <h2 className="text-2xl font-bold text-brand-navy mt-8">2. Tanggung Jawab Pengguna</h2>
          <p>Anda bertanggung jawab atas keaslian data yang Anda unggah. AnI Buddy tidak bertanggung jawab atas keputusan bisnis yang diambil berdasarkan hasil analisis AI.</p>
          
          <h2 className="text-2xl font-bold text-brand-navy mt-8">3. Batasan Layanan</h2>
          <p>Kami berhak untuk memperbarui atau menghentikan fitur tertentu untuk meningkatkan kualitas sistem secara keseluruhan.</p>
          
          <h2 className="text-2xl font-bold text-brand-navy mt-8">4. Hukum yang Berlaku</h2>
          <p>Ketentuan ini diatur oleh hukum Republik Indonesia, termasuk UU Perlindungan Data Pribadi (PDP).</p>
        </div>
      </motion.div>
    </main>
    <GlobalFooter onNav={onNav} />
  </div>
);

const LandingPage = ({ onStart, onNav }: { onStart: () => void, onNav: (v: any) => void }) => {
  const targetRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: targetRef });
  
  const heroY = useTransform(scrollYProgress, [0, 0.2], ["0%", "20%"]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.15], [1, 0]);
  
  const featureY = useTransform(scrollYProgress, [0.1, 0.3], [100, 0]);
  const featureOpacity = useTransform(scrollYProgress, [0.1, 0.2], [0, 1]);

  const flowY = useTransform(scrollYProgress, [0.3, 0.5], [100, 0]);
  const flowOpacity = useTransform(scrollYProgress, [0.35, 0.45], [0, 1]);
  
  return (
    <div className="bg-white overflow-hidden" ref={targetRef}>
      <Navbar onStart={onStart} onNav={onNav} isLanding={true} />

      {/* Parallax Hero Section */}
      <section className="relative h-[100vh] md:h-[115vh] flex items-center justify-center overflow-hidden">
        <motion.div style={{ y: heroY }} className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-brand-navy z-10 opacity-60" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(20,184,166,0.3),transparent_50%)] z-20" />
          <video 
            autoPlay 
            muted 
            loop 
            playsInline 
            className="absolute inset-0 w-full h-full object-cover opacity-30"
          >
            <source src="/media/mp_.mp4" type="video/mp4" />
          </video>
        </motion.div>
        
        <motion.div style={{ opacity: heroOpacity }} className="relative z-30 max-w-7xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="flex justify-center mb-8">
              <span className="bg-white/10 backdrop-blur-xl border border-white/20 text-white/90 px-6 md:px-8 py-2 md:py-3 rounded-full text-[8px] md:text-[10px] font-bold tracking-[0.4em] uppercase shadow-2xl">
                The Future of UMKM Intelligence
              </span>
            </div>
            <h1 className="text-4xl md:text-7xl lg:text-9xl font-display font-bold text-white mb-8 md:mb-10 tracking-tighter leading-[0.9] md:leading-[0.85]">
              Kuasai <span className="text-brand-accent">Bisnis</span> <br /> 
              Dengan <span className="italic font-light">Data.</span>
            </h1>
            <p className="text-lg md:text-2xl text-white/70 max-w-3xl mx-auto mb-12 md:mb-16 font-medium leading-relaxed px-4">
              Transformasikan ribuan baris data penjualan menjadi strategi pertumbuhan yang tajam dalam hitungan detik. 
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 md:gap-8">
              <button 
                onClick={onStart}
                className="w-full sm:w-auto bg-brand-accent text-white px-8 md:px-12 py-4 md:py-6 rounded-full font-bold text-lg md:text-xl shadow-[0_20px_60px_rgba(20,184,166,0.4)] hover:shadow-[0_25px_80px_rgba(20,184,166,0.5)] transition-all hover:-translate-y-2 active:scale-95"
              >
                Mulai Akses Enterprise
              </button>
              <button onClick={() => onNav("features")} className="w-full sm:w-auto px-8 md:px-12 py-4 md:py-6 rounded-full font-bold text-lg md:text-xl text-white border border-white/20 backdrop-blur-sm hover:bg-white/10 transition-all hover:-translate-y-1">
                Eksplor Teknologi
              </button>
            </div>
          </motion.div>
        </motion.div>

        <div className="absolute bottom-10 md:bottom-16 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4 md:gap-6 z-30">
          <div className="w-px h-12 md:h-20 bg-gradient-to-b from-brand-accent/60 to-transparent" />
          <span className="text-[8px] md:text-[10px] text-white/30 font-bold uppercase tracking-[0.6em]">Discover</span>
        </div>
      </section>

      {/* Feature Showcase */}
      <motion.section style={{ y: featureY, opacity: featureOpacity }} className="py-32 md:py-48 px-6 relative bg-white">
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-20 md:mb-32">
            <h2 className="text-[10px] md:text-[12px] font-bold text-brand-accent uppercase tracking-[0.4em] mb-4 md:mb-6">Features</h2>
            <h3 className="text-3xl md:text-5xl font-display font-bold text-brand-navy mb-6 md:mb-8 tracking-tight leading-tight">Teknologi Mahal untuk Semua Lini Bisnis</h3>
            <p className="text-base md:text-xl text-slate-400 font-medium leading-relaxed px-4">Kami menghadirkan kemampuan data architect korporasi ke dalam genggaman AnI Buddy.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-16">
            <FeatureCard 
              icon={Zap} 
              title="Analisa Kilat" 
              desc="Ingestion data 15x lebih cepat dengan Medallion Architecture yang dioptimalkan untuk UMKM."
            />
            <FeatureCard 
              icon={ShieldCheck} 
              title="Private & Secure" 
              desc="Keamanan data Anda adalah prioritas utama. Enkripsi end-to-end untuk setiap laporan."
            />
            <FeatureCard 
              icon={BarChart3} 
              title="Aksi Nyata" 
              desc="Bukan sekadar grafik. AI kami memberikan 3 langkah konkret untuk menaikkan profit harian."
            />
          </div>
        </div>
      </motion.section>

      {/* Flow Section Replacement */}
      <motion.section style={{ y: flowY, opacity: flowOpacity }} className="py-20 md:py-32 px-6 bg-slate-50 overflow-hidden relative">
        <div className="absolute top-1/2 left-0 w-full h-px bg-slate-200 z-0 hidden md:block" />
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-20">
            <h2 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">How it works</h2>
            <h3 className="text-3xl font-display font-bold text-brand-navy tracking-tight">Alur Kerja Cerdas</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
             {[
               { 
                 step: "01", 
                 title: "Bronze Ingestion", 
                 desc: "Unggah file CSV/Excel mentah Anda. Sistem akan langsung mengenkripsi data di level transport.",
                 icon: Upload,
                 color: "#CD7F32"
               },
               { 
                 step: "02", 
                 title: "Silver Sanitization", 
                 desc: "AI membersihkan data dari duplikasi, memvalidasi format, dan melakukan masking pada info sensitif.",
                 icon: ShieldCheck,
                 color: "#C0C0C0"
               },
               { 
                 step: "03", 
                 title: "Gold Intelligence", 
                 desc: "Data yang telah bersih diolah oleh algoritma untuk menghasilkan strategi peningkatan profit.",
                 icon: BarChart3,
                 color: "#FFD700"
               }
             ].map((f, i) => (
               <div key={i} className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm relative group hover:shadow-xl transition-all duration-500">
                  <div 
                    className="w-14 h-14 rounded-2xl flex items-center justify-center text-white mb-8 group-hover:scale-110 transition-transform"
                    style={{ backgroundColor: f.color }}
                  >
                    <f.icon size={28} />
                  </div>
                  <div 
                    className="absolute top-10 right-10 text-5xl font-display font-black transition-colors"
                    style={{ color: f.color, opacity: 0.15 }}
                  >
                    {f.step}
                  </div>
                  <h4 className="text-xl font-display font-bold text-brand-navy mb-4">{f.title}</h4>
                  <p className="text-slate-400 text-sm leading-relaxed font-medium">{f.desc}</p>
               </div>
             ))}
          </div>
        </div>
      </motion.section>

      {/* Experience CTA */}
      <section className="py-20 px-6">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1 }}
          viewport={{ once: true }}
          className="max-w-7xl mx-auto relative rounded-[2.5rem] md:rounded-[4rem] overflow-hidden bg-brand-navy p-12 md:p-32 text-center"
        >
           <div className="absolute inset-0 opacity-20 pointer-events-none" 
                style={{ backgroundImage: "radial-gradient(ellipse at center, #14b8a6, transparent 70%)" }} />
           
           <div className="relative z-10">
              <h2 className="text-3xl md:text-7xl font-display font-bold text-white mb-6 md:mb-10 tracking-tighter leading-tight">AnI Buddy can do it, <br /> <span className="text-brand-accent">you can do it.</span></h2>
              <p className="text-base md:text-2xl text-white/60 max-w-2xl mx-auto mb-10 md:mb-16 leading-relaxed px-4">Bergabunglah dengan ekosistem bisnis modern yang digerakkan oleh data pintar.</p>
              <button 
                onClick={onStart}
                className="w-full sm:w-auto bg-white text-brand-navy px-10 md:px-16 py-5 md:py-7 rounded-full font-bold text-lg md:text-2xl shadow-3xl hover:bg-brand-accent hover:text-white transition-all hover:scale-105 active:scale-95"
              >
                Mulai Sekarang
              </button>
           </div>
        </motion.div>
      </section>

      <GlobalFooter onNav={onNav} />
    </div>
  );
};

// --- Dashboard Component (The Redesigned Functional Page) ---

const formatIDR = (amount: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
};

const CHART_COLORS = ['#0d9488', '#0f766e', '#115e59', '#14b8a6', '#2dd4bf', '#5eead4', '#99f6e4'];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/90 backdrop-blur-md border border-slate-100 p-4 rounded-2xl shadow-2xl">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">{label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
            <span className="text-sm font-bold text-brand-navy">
              {entry.name === 'revenue' ? formatIDR(entry.value) : `${entry.value} ${entry.name === 'value' ? 'Units' : 'Trx'}`}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

const SalesTrendChart = ({ data }: { data: any[] }) => (
  <div className="h-full w-full">
    <ResponsiveContainer width="100%" height="100%">
      <ComposedChart data={data} margin={{ top: 10, right: 0, bottom: 0, left: -15 }}>
        <defs>
          <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.1}/>
            <stop offset="95%" stopColor="#14b8a6" stopOpacity={0}/>
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
        <XAxis 
          dataKey="date" 
          axisLine={false} 
          tickLine={false} 
          tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 600 }}
          dy={10}
        />
        <YAxis 
          yAxisId="left" 
          axisLine={false} 
          tickLine={false} 
          tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 600 }}
          tickFormatter={(value) => `Rp${value/1000}k`}
        />
        <YAxis 
          yAxisId="right" 
          orientation="right" 
          axisLine={false} 
          tickLine={false} 
          tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 600 }}
        />
        <Tooltip content={<CustomTooltip />} />
        <Area yAxisId="left" type="monotone" dataKey="revenue" fill="url(#colorRev)" stroke="none" />
        <Bar yAxisId="left" dataKey="revenue" fill="#14b8a6" radius={[4, 4, 0, 0]} barSize={30} />
        <Line yAxisId="right" type="monotone" dataKey="transactions" stroke="#0f766e" strokeWidth={3} dot={{ r: 4, fill: '#0f766e', strokeWidth: 2, stroke: '#fff' }} />
      </ComposedChart>
    </ResponsiveContainer>
  </div>
);

const ProductDistributionChart = ({ data }: { data: any[] }) => (
  <div className="h-full w-full">
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius="50%"
          outerRadius="75%"
          paddingAngle={3}
          dataKey="value"
          stroke="none"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        <Legend 
          verticalAlign="bottom" 
          height={36} 
          iconType="circle"
          layout="horizontal"
          align="center"
          wrapperStyle={{ paddingTop: '20px' }}
          formatter={(value) => <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{value}</span>}
        />
      </PieChart>
    </ResponsiveContainer>
  </div>
);

const DataTable = ({ data }: { data: SalesRecord[] }) => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const itemsPerPage = 8;
  
  const filteredData = data.filter(r => 
    r.nama_produk.toLowerCase().includes(search.toLowerCase()) ||
    r.tanggal.includes(search)
  );
  
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = filteredData.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  return (
    <div className="w-full">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div className="relative group w-full sm:w-auto">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-brand-accent transition-colors" size={18} />
          <input 
            type="text" 
            placeholder="Cari transaksi..." 
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="pl-12 pr-6 py-3 rounded-2xl bg-slate-50 border border-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-accent/20 transition-all text-sm font-medium w-full sm:w-64 md:w-80"
          />
        </div>
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button 
            disabled={page === 1}
            onClick={() => setPage(p => p - 1)}
            className="p-2 rounded-xl hover:bg-slate-50 border border-slate-100 disabled:opacity-30 transition-all"
          >
            <ChevronLeft size={20} />
          </button>
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest px-4">{page} / {totalPages || 1}</span>
          <button 
            disabled={page === totalPages || totalPages === 0}
            onClick={() => setPage(p => p + 1)}
            className="p-2 rounded-xl hover:bg-slate-50 border border-slate-100 disabled:opacity-30 transition-all"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      <div className="overflow-x-auto rounded-2xl md:rounded-[2rem] border border-slate-100 overflow-hidden">
        <table className="w-full text-left border-collapse table-auto">
          <thead>
            <tr className="bg-slate-50/50">
              <th className="px-2 md:px-8 py-3 md:py-5 text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-[0.1em] md:tracking-[0.2em] border-b border-slate-100">Tanggal</th>
              <th className="px-2 md:px-8 py-3 md:py-5 text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-[0.1em] md:tracking-[0.2em] border-b border-slate-100">Produk</th>
              <th className="px-2 md:px-8 py-3 md:py-5 text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-[0.1em] md:tracking-[0.2em] border-b border-slate-100 text-center">Jumlah</th>
              <th className="px-2 md:px-8 py-3 md:py-5 text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-[0.1em] md:tracking-[0.2em] border-b border-slate-100 text-right">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50 bg-white">
            {paginatedData.map((row, i) => (
              <tr key={i} className="hover:bg-teal-50/10 transition-colors group">
                <td className="px-2 md:px-8 py-3 md:py-5 text-[10px] md:text-sm font-medium text-slate-500 whitespace-nowrap">{row.tanggal}</td>
                <td className="px-2 md:px-8 py-3 md:py-5 text-[10px] md:text-sm font-bold text-brand-navy break-words min-w-[80px] md:min-w-[150px]">{row.nama_produk}</td>
                <td className="px-2 md:px-8 py-3 md:py-5 text-[10px] md:text-sm font-bold text-slate-400 text-center">{row.jumlah}</td>
                <td className="px-2 md:px-8 py-3 md:py-5 text-[10px] md:text-sm font-bold text-brand-navy text-right whitespace-nowrap">{formatIDR(row.harga_total)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {paginatedData.length === 0 && (
          <div className="py-20 text-center">
            <p className="text-slate-300 font-medium">Data tidak ditemukan.</p>
          </div>
        )}
      </div>
    </div>
  );
};

const DataPipelineVisual = () => (
  <div className="py-12 md:py-20">
    <div className="flex flex-col lg:flex-row items-center justify-between gap-8 relative">
      {/* Connector line for desktop */}
      <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-slate-100 via-brand-accent/30 to-slate-100 -z-10" />
      
      <div className="w-full lg:w-1/3 p-8 rounded-[2.5rem] bg-white border border-slate-100 shadow-sm relative group hover:-translate-y-2 transition-all duration-500">
        <div className="absolute -top-4 left-8 px-4 py-1 bg-[#CD7F32] text-white text-[10px] font-bold uppercase tracking-widest rounded-full">Bronze Layer</div>
        <div className="mb-6 flex items-center justify-between text-[#CD7F32]/40">
          <Database size={32} />
          <span className="text-[10px] font-bold uppercase tracking-widest">Raw Ingestion</span>
        </div>
        <h4 className="text-xl font-bold text-brand-navy mb-4">Data Mentah (CSV)</h4>
        <p className="text-sm text-slate-500 leading-relaxed">System menerima ribuan baris data penjualan langsung dari mesin kasir atau log manual Anda tanpa modifikasi.</p>
      </div>

      <div className="w-full lg:w-1/3 p-8 rounded-[2.5rem] bg-white border border-slate-100 shadow-sm relative group hover:-translate-y-2 transition-all duration-500">
        <div className="absolute -top-4 left-8 px-4 py-1 bg-[#C0C0C0] text-slate-800 text-[10px] font-bold uppercase tracking-widest rounded-full">Silver Layer</div>
        <div className="mb-6 flex items-center justify-between text-[#C0C0C0]">
          <Zap size={32} />
          <span className="text-[10px] font-bold uppercase tracking-widest">Validated & Clean</span>
        </div>
        <h4 className="text-xl font-bold text-brand-navy mb-4">Validasi Integritas</h4>
        <p className="text-sm text-slate-500 leading-relaxed">Menghapus duplikasi, memperbaiki format tanggal, dan memvalidasi nilai angka untuk menjamin data yang bersih.</p>
      </div>

      <div className="w-full lg:w-1/3 p-8 rounded-[2.5rem] bg-white border border-slate-100 shadow-sm relative group hover:-translate-y-2 transition-all duration-500 border-[#FFD700]/30 shadow-yellow-500/5">
        <div className="absolute -top-4 left-8 px-4 py-1 bg-[#FFD700] text-brand-navy text-[10px] font-bold uppercase tracking-widest rounded-full">Gold Layer</div>
        <div className="mb-6 flex items-center justify-between text-[#FFD700]">
          <BarChart3 size={32} />
          <span className="text-[10px] font-bold uppercase tracking-widest">Business Ready</span>
        </div>
        <h4 className="text-xl font-bold text-brand-navy mb-4">Intelijen Strategis</h4>
        <p className="text-sm text-slate-500 leading-relaxed">Data siap saji diubah menjadi metrik performa, tren pertumbuhan, dan rekomendasi aksi nyata oleh AI.</p>
      </div>
    </div>
  </div>
);

const DataValidationModal = ({ 
  dirtyRecords, 
  onClose, 
  onConfirm 
}: { 
  dirtyRecords: any[], 
  onClose: () => void, 
  onConfirm: (fixedRecords: any[]) => void 
}) => {
  const [records, setRecords] = useState([...dirtyRecords]);
  const [view, setView] = useState<"alert" | "table">("alert");

  const handleUpdate = (index: number, field: string, value: string) => {
    const newRecords = [...records];
    const numValue = parseFloat(value) || 0;
    newRecords[index] = { ...newRecords[index], [field]: numValue };
    setRecords(newRecords);
  };

  const isComplete = records.every(r => r.jumlah > 0 && r.harga_total > 0);

  if (view === "alert") {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-brand-navy/60 backdrop-blur-md">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-[3rem] p-10 md:p-12 max-w-lg w-full shadow-2xl border border-slate-100 text-center"
        >
          <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-8 text-amber-500">
            <AlertTriangle size={40} />
          </div>
          <h3 className="text-2xl font-display font-bold text-brand-navy mb-4">Data Terdeteksi "Kotor"</h3>
          <p className="text-slate-500 mb-10 leading-relaxed font-medium">
            Sistem mendeteksi <span className="text-brand-navy font-bold">{dirtyRecords.length} baris data</span> yang tidak lengkap (jumlah atau harga kosong). 
            Rekomendasi strategis mungkin menjadi kurang akurat jika data ini diabaikan.
          </p>
          <div className="flex flex-col gap-4">
            <button 
              onClick={() => setView("table")}
              className="w-full bg-brand-navy text-white py-4 rounded-full font-bold text-lg hover:bg-slate-800 transition-all flex items-center justify-center gap-3"
            >
              Ya, Validasi Sekarang <ArrowRight size={20} />
            </button>
            <button 
              onClick={onClose}
              className="w-full text-slate-400 py-3 rounded-full font-bold text-sm uppercase tracking-widest hover:text-brand-navy transition-colors"
            >
              Nanti Saja
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-brand-navy/60 backdrop-blur-md">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-[3rem] w-full max-w-4xl max-h-[85vh] flex flex-col shadow-2xl border border-slate-100 overflow-hidden"
      >
        <div className="p-8 md:p-10 border-b border-slate-50 flex items-center justify-between bg-white sticky top-0 z-10">
          <div>
            <h3 className="text-2xl font-display font-bold text-brand-navy">Validasi Data Gold Layer</h3>
            <p className="text-sm font-medium text-slate-400">Lengkapi kolom yang kosong untuk akurasi maksimal.</p>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-slate-50 rounded-2xl transition-colors">
            <X size={24} className="text-slate-300" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          <div className="rounded-[2rem] border border-slate-100 overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">Produk</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">Jumlah</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">Harga Total (Rp)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {records.map((r, i) => (
                  <tr key={i} className={cn("transition-colors", (r.jumlah === 0 || r.harga_total === 0) ? "bg-amber-50/30" : "bg-white")}>
                    <td className="px-6 py-4 font-bold text-brand-navy text-sm">{r.nama_produk || "Tanpa Nama"}</td>
                    <td className="px-6 py-4">
                      <input 
                        type="number" 
                        value={r.jumlah || ""} 
                        onChange={(e) => handleUpdate(i, "jumlah", e.target.value)}
                        placeholder="0"
                        className={cn(
                          "w-24 px-3 py-2 rounded-xl border text-sm font-bold focus:outline-none transition-all",
                          r.jumlah === 0 ? "border-amber-200 bg-amber-50" : "border-slate-100 focus:border-brand-accent"
                        )}
                      />
                    </td>
                    <td className="px-6 py-4">
                      <input 
                        type="number" 
                        value={r.harga_total || ""} 
                        onChange={(e) => handleUpdate(i, "harga_total", e.target.value)}
                        placeholder="0"
                        className={cn(
                          "w-full px-3 py-2 rounded-xl border text-sm font-bold focus:outline-none transition-all",
                          r.harga_total === 0 ? "border-amber-200 bg-amber-50" : "border-slate-100 focus:border-brand-accent"
                        )}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="p-8 md:p-10 border-t border-slate-50 bg-slate-50/30 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3 text-xs font-bold text-slate-400 uppercase tracking-widest">
            {isComplete ? (
              <>
                <div className="w-2 h-2 rounded-full bg-teal-500" />
                Semua data terlengkapi
              </>
            ) : (
              <>
                <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                {records.filter(r => r.jumlah === 0 || r.harga_total === 0).length} belum valid
              </>
            )}
          </div>
          <div className="flex gap-4 w-full sm:w-auto">
             <button 
              onClick={() => onConfirm(records)}
              className="flex-1 sm:flex-none bg-brand-navy text-white px-10 py-4 rounded-full font-bold text-lg hover:bg-slate-800 transition-all shadow-xl flex items-center justify-center gap-3"
            >
              Simpan & Analisa <Save size={20} />
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default function App() {
  const [view, setView] = useState<"landing" | "dashboard" | "features" | "security" | "privacy" | "terms">("landing");

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [view]);

  const [file, setFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [metrics, setMetrics] = useState<BusinessMetrics | null>(null);
  const [rawData, setRawData] = useState<SalesRecord[]>([]);
  const [report, setReport] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);

  // Validation States
  const [dirtyRecords, setDirtyRecords] = useState<any[]>([]);
  const [allParsedRecords, setAllParsedRecords] = useState<any[]>([]);
  const [showValidation, setShowValidation] = useState(false);

  const parseFileLocally = (file: File): Promise<any[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      const extension = file.name.split('.').pop()?.toLowerCase();

      reader.onload = (e) => {
        const data = e.target?.result;
        try {
          if (extension === 'csv') {
            Papa.parse(data as string, {
              header: true,
              skipEmptyLines: true,
              complete: (results) => resolve(results.data),
              error: (err) => reject(err)
            });
          } else if (extension === 'xlsx' || extension === 'xls') {
            const workbook = XLSX.read(data, { type: 'binary' });
            const sheet = workbook.Sheets[workbook.SheetNames[0]];
            resolve(XLSX.utils.sheet_to_json(sheet));
          } else {
            reject(new Error("Format file tidak didukung."));
          }
        } catch (err) {
          reject(err);
        }
      };

      if (extension === 'csv') {
        reader.readAsText(file);
      } else {
        reader.readAsBinaryString(file);
      }
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setError(null);
      setMetrics(null);
      setReport(null);
      setRawData([]);

      try {
        const parsed = await parseFileLocally(selectedFile);
        
        // Find keys heuristically and store them
        const normalized = parsed.map(r => {
          const findKeyInfo = (vars: string[]) => {
            const key = Object.keys(r).find(k => 
              vars.some(v => k.toLowerCase().replace(/[^a-z]/g, "") === v.toLowerCase().replace(/[^a-z]/g, ""))
            );
            return { key, value: key ? r[key] : null };
          };

          const prodInfo = findKeyInfo(["namaproduk", "produk", "item", "product", "nama"]);
          const qtyInfo = findKeyInfo(["jumlah", "qty", "quantity", "unit", "volume"]);
          const priceInfo = findKeyInfo(["hargatotal", "total", "revenue", "subtotal", "amount"]);
          const dateInfo = findKeyInfo(["tanggal", "date", "waktu", "time"]);

          return {
            original: r,
            keys: {
              nama_produk: prodInfo.key,
              jumlah: qtyInfo.key,
              harga_total: priceInfo.key,
              tanggal: dateInfo.key
            },
            nama_produk: prodInfo.value,
            jumlah: parseFloat(String(qtyInfo.value || 0)) || 0,
            harga_total: parseFloat(String(priceInfo.value || "").replace(/[^0-9.-]+/g,"")) || 0
          };
        });

        const dirty = normalized.filter(r => !r.nama_produk || r.jumlah === 0 || r.harga_total === 0);
        setAllParsedRecords(normalized);
        if (dirty.length > 0) {
          setDirtyRecords(dirty);
          setShowValidation(true);
        } else {
          setDirtyRecords([]);
        }
      } catch (err: any) {
        setError("Gagal membaca berkas: " + err.message);
      }
    }
  };

  const runAnalysis = async (customRecords?: any[]) => {
    if (!file && !customRecords) return;
    setIsAnalyzing(true);
    setError(null);
    setMetrics(null);
    setRawData([]);
    setReport(null);

    try {
      let dataToAnalyze;
      
      if (customRecords) {
        // Merge fixed dirty records back into the main list by updating the original objects
        const fixedMap = new Map(customRecords.map(r => [r.original, r]));
        
        const mergedData = allParsedRecords.map(r => {
          const fixed = fixedMap.get(r.original);
          if (fixed) {
            // Create a copy of original and patch it with validated values
            const patched = { ...r.original };
            if (r.keys.nama_produk) patched[r.keys.nama_produk] = fixed.nama_produk;
            if (r.keys.jumlah) patched[r.keys.jumlah] = fixed.jumlah;
            if (r.keys.harga_total) patched[r.keys.harga_total] = fixed.harga_total;
            return patched;
          }
          return r.original;
        });
        
        const csv = Papa.unparse(mergedData);
        
        const formData = new FormData();
        const blob = new Blob([csv], { type: 'text/csv' });
        formData.append("file", blob, "validated_data.csv");
        
        const res = await fetch("/api/analyze", { method: "POST", body: formData });
        if (!res.ok) throw new Error("Gagal memproses data.");
        dataToAnalyze = await res.json();
      } else {
        const formData = new FormData();
        formData.append("file", file!);
        const res = await fetch("/api/analyze", { method: "POST", body: formData });
        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.detail || errData.error || "Gagal memproses data.");
        }
        dataToAnalyze = await res.json();
      }

      setMetrics(dataToAnalyze.metrics);
      setRawData(dataToAnalyze.rawData);
      const aiReport = await generateStrategicInsights(dataToAnalyze.metrics);
      setReport(aiReport);
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan yang tidak terduga.");
    } finally {
      setIsAnalyzing(false);
      setShowValidation(false);
    }
  };

  // Specialized Views
  if (view === "landing") return <LandingPage onStart={() => setView("dashboard")} onNav={setView} />;
  if (view === "features") return <FeaturesPage onStart={() => setView("dashboard")} onNav={setView} />;
  if (view === "security") return <SecurityPage onStart={() => setView("dashboard")} onNav={setView} />;
  if (view === "privacy") return <PrivacyPage onNav={setView} />;
  if (view === "terms") return <TermsPage onNav={setView} />;

  return (
    <div className="min-h-screen bg-[#fafbfc]">
      <Navbar onStart={() => {}} onNav={setView} isLanding={false} />
      
      <main className="max-w-7xl mx-auto px-6 md:px-12 pt-32 md:pt-40 pb-20 md:pb-32">
        <header className="mb-12 md:mb-20">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <div className="flex items-center gap-3 mb-6">
               <span className="bg-brand-accent/10 text-brand-accent px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest border border-brand-accent/20">
                 Enterprise Workspace
               </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-display font-bold text-brand-navy tracking-tight mb-4">Command Center Anda</h1>
            <p className="text-slate-400 font-medium text-base md:text-lg">Integrasikan data penjualan Anda untuk visualisasi intelegen otomatis.</p>
          </motion.div>
        </header>

        {showValidation && (
          <DataValidationModal 
            dirtyRecords={dirtyRecords} 
            onClose={() => setShowValidation(false)} 
            onConfirm={(fixed) => {
              setShowValidation(false);
              runAnalysis(fixed);
            }} 
          />
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12">
          {/* Dashboard Left Track */}
          <div className="lg:col-span-4 flex flex-col gap-8 md:gap-10">
            <div 
              onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
              onDragLeave={() => setDragActive(false)}
              onDrop={(e) => { e.preventDefault(); setDragActive(false); if(e.dataTransfer.files[0]) setFile(e.dataTransfer.files[0]); }}
              className={cn(
                "p-8 md:p-12 rounded-[2.5rem] md:rounded-[3.5rem] border-2 border-dashed flex flex-col items-center text-center transition-all duration-700 h-fit",
                dragActive ? "border-brand-accent bg-teal-50/20 scale-[1.03]" : "border-slate-100 bg-white",
                file ? "border-brand-accent/30 premium-shadow" : "shadow-[0_20px_60px_rgba(0,0,0,0.02)]"
              )}
            >
              {!file ? (
                <>
                  <div className="bg-slate-50 p-8 md:p-10 rounded-[1.5rem] md:rounded-[2.5rem] mb-6 md:mb-10 group-hover:bg-brand-accent group-hover:text-white transition-all duration-500">
                    <Upload size={32} className="text-slate-300 md:size-[48px]" />
                  </div>
                  <h3 className="text-lg md:text-xl font-display font-bold text-brand-navy mb-3">Sync Dataset</h3>
                  <p className="text-slate-400 text-xs md:text-sm font-medium leading-relaxed mb-8 md:mb-10">Unggah berkas CSV untuk memulai ekstraksi Gold Layer.</p>
                  <label className="w-full bg-brand-navy text-white py-4 md:py-5 rounded-full font-bold text-base md:text-lg cursor-pointer hover:bg-slate-800 transition-all shadow-xl active:scale-95 text-center">
                    Pilih CSV / Excel
                    <input type="file" className="hidden" accept=".csv, .xlsx, .xls" onChange={handleFileChange} />
                  </label>
                </>
              ) : (
                <div className="w-full text-center">
                   <div className="bg-slate-50 p-6 md:p-8 rounded-[1.5rem] md:rounded-[2rem] border border-slate-100 mb-8 md:mb-10">
                    <CheckCircle2 size={24} className="text-brand-accent mx-auto mb-4 md:size-[32px]" />
                    <p className="font-bold text-brand-navy truncate text-sm mb-1">{file.name}</p>
                    <p className="text-[10px] uppercase font-bold tracking-[0.2em] text-slate-300">Verified & Ready</p>
                  </div>
                  <div className="flex flex-col gap-6">
                    {!metrics && !error && (
                      <button 
                        onClick={() => runAnalysis()}
                        className="group w-full bg-brand-accent text-white py-4 md:py-5 rounded-full font-bold text-base md:text-lg flex items-center justify-center gap-3 hover:shadow-2xl hover:shadow-teal-500/20 transition-all active:scale-95 duration-500"
                      >
                        Mulai Analisa <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform duration-500" />
                      </button>
                    )}
                    
                    {(metrics || error || file) && (
                      <button 
                        onClick={() => { 
                          setFile(null); 
                          setMetrics(null); 
                          setReport(null); 
                          setRawData([]); 
                          setError(null);
                        }}
                        className="bg-slate-100/50 hover:bg-slate-100 text-slate-500 py-3 rounded-full transition-all font-bold text-[10px] uppercase tracking-[0.3em] flex items-center justify-center gap-2"
                      >
                        <X size={14} /> Clear Workspace
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
            
            {/* Quick Metrics */}
            {metrics && (
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex flex-col gap-6">
                 <div className="metric-card bg-white p-8 md:p-10 rounded-[2.5rem] md:rounded-[3rem] premium-shadow border border-slate-50">
                    <div className="flex items-center justify-between mb-8">
                       <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em]">Total Revenue</span>
                       <TrendingUp size={16} className="text-brand-accent" />
                    </div>
                    <p className="text-3xl md:text-4xl font-display font-bold text-brand-navy tracking-tighter">{formatIDR(metrics.totalRevenue)}</p>
                  </div>

                  <div className="metric-card bg-white p-8 md:p-10 rounded-[2.5rem] md:rounded-[3rem] premium-shadow border border-slate-50">
                    <div className="flex items-center justify-between mb-8">
                       <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em]">Transactions</span>
                       <TableIcon size={16} className="text-brand-accent" />
                    </div>
                    <p className="text-3xl md:text-4xl font-display font-bold text-brand-navy tracking-tighter">{metrics.totalTransactions}</p>
                    <p className="text-[10px] font-bold text-slate-300 mt-4 uppercase tracking-[0.1em]">Total Sales Count</p>
                  </div>
              </motion.div>
            )}
          </div>

          {/* Dashboard Right Track: Analysis View */}
          <div className="lg:col-span-8 flex flex-col gap-8 md:gap-12">
            
            {/* Visual Analytics Grid */}
            {metrics && (
              <motion.div 
                initial={{ opacity: 0, y: 30 }} 
                animate={{ opacity: 1, y: 0 }} 
                className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12"
              >
                <div className="bg-white p-8 md:p-12 rounded-[2.5rem] md:rounded-[4rem] premium-shadow border border-slate-50 overflow-hidden">
                  <div className="flex justify-between items-center mb-10">
                    <h4 className="text-lg md:text-xl font-display font-bold text-brand-navy">Trend Penjualan</h4>
                    <span className="text-[10px] font-bold text-brand-accent uppercase tracking-widest text-right">
                      {metrics.salesTrend.length > 30 ? 'Monthly' : metrics.salesTrend.length > 7 ? 'Weekly' : 'Daily'} Volume
                    </span>
                  </div>
                  <div className="h-[300px] md:h-[400px]">
                    <SalesTrendChart data={metrics.salesTrend} />
                  </div>
                </div>

                <div className="bg-white p-8 md:p-12 rounded-[2.5rem] md:rounded-[4rem] premium-shadow border border-slate-50 overflow-hidden">
                  <div className="flex justify-between items-center mb-10">
                    <h4 className="text-lg md:text-xl font-display font-bold text-brand-navy">Persebaran Produk</h4>
                    <span className="text-[10px] font-bold text-brand-accent uppercase tracking-widest">Quantity Share</span>
                  </div>
                  <div className="h-[300px] md:h-[400px]">
                    <ProductDistributionChart data={metrics.productDistribution} />
                  </div>
                </div>

                <div className="md:col-span-2 bg-white p-4 md:p-12 rounded-[2.5rem] md:rounded-[4rem] premium-shadow border border-slate-50">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-12">
                     <div className="px-4 md:px-0">
                       <h4 className="text-xl md:text-2xl font-display font-bold text-brand-navy mb-2">Dataset Explorer</h4>
                       <p className="text-sm font-medium text-slate-400">Navigasi dan filter seluruh data mentah hasil ekstraksi.</p>
                     </div>
                     <div className="hidden sm:block bg-brand-accent/10 p-3 md:p-4 rounded-2xl md:rounded-3xl">
                       <TableIcon size={24} className="text-brand-accent" />
                     </div>
                  </div>
                  <DataTable data={rawData} />
                </div>
              </motion.div>
            )}

            {/* AI Report Card - MOVED TO BOTTOM */}
            <div className="bg-white rounded-[2.5rem] md:rounded-[4rem] border border-slate-50 premium-shadow min-h-[400px] md:min-h-[500px] flex flex-col relative overflow-hidden">
              {isAnalyzing && (
                <div className="absolute inset-0 z-20 bg-white/40 backdrop-blur-xl flex flex-col items-center justify-center p-6 text-center">
                  <motion.div 
                    animate={{ rotate: 360 }} 
                    transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                    className="mb-6 md:mb-8 p-6 md:p-10 rounded-full border-4 border-slate-50 border-t-brand-accent border-r-brand-accent"
                  >
                    <BarChart3 size={32} className="text-brand-accent md:size-[40px]" />
                  </motion.div>
                  <p className="text-lg md:text-xl font-display font-bold text-brand-navy tracking-tight animate-pulse">Menghasilkan Intelijen Bisnis...</p>
                </div>
              )}
              
              <div className="px-8 md:px-12 py-6 md:py-10 border-b border-slate-50 flex items-center justify-between flex-shrink-0 bg-white z-10">
                <div className="flex items-center gap-3 md:gap-4 text-[10px] md:text-xs font-bold uppercase tracking-[0.4em] text-slate-300">
                  <div className={cn("w-1.5 h-1.5 md:w-2 md:h-2 rounded-full", report ? "bg-teal-500" : "bg-slate-100")} />
                  Strategic Result
                </div>
                {report && (
                  <div className="flex items-center gap-3 md:gap-5">
                    <span className="hidden sm:inline text-[9px] font-bold text-slate-300 uppercase tracking-widest">Model: Gemini Flash</span>
                    <button className="p-2 md:p-3 hover:bg-slate-50 rounded-xl md:rounded-2xl transition-colors border border-slate-100">
                      <FileText size={16} className="text-slate-400 md:size-[18px]" />
                    </button>
                  </div>
                )}
              </div>

              <div className="flex-1 px-6 py-10 md:p-16 overflow-y-auto overflow-x-hidden custom-scrollbar">
                {report ? (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1 }} className="markdown-body prose prose-sm md:prose-slate max-w-none break-words">
                    <Markdown>{report}</Markdown>
                  </motion.div>
                ) : !isAnalyzing ? (
                  <div className="h-full flex flex-col items-center justify-center text-center px-4 md:px-12">
                    <div className="bg-slate-50 p-10 md:p-16 rounded-full mb-8 md:mb-12 border border-slate-50 relative group">
                      <Zap size={48} className="text-slate-100 md:size-[80px] group-hover:text-brand-accent transition-colors duration-1000" />
                      <div className="absolute inset-0 bg-brand-accent blur-3xl opacity-0 group-hover:opacity-10 transition-opacity duration-1000"></div>
                    </div>
                    <h3 className="text-2xl md:text-3xl font-display font-bold text-slate-200 mb-4 tracking-tight">Menunggu Dataset</h3>
                    <p className="text-sm md:text-base text-slate-300 max-w-sm mx-auto font-medium leading-relaxed">System Intelligence siap diaktifkan. Unggah laporan penjualan Anda untuk memulai de-konfigurasi data.</p>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </div>

        {error && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-12 bg-red-50 p-8 rounded-[2.5rem] border border-red-100 flex items-center gap-6 shadow-sm">
            <div className="bg-red-500/10 p-3 rounded-2xl">
              <AlertCircle className="text-red-500" size={24} />
            </div>
            <p className="text-lg font-display font-bold text-red-900 leading-tight">{error}</p>
          </motion.div>
        )}
      </main>

      <footer className="fixed bottom-0 left-0 right-0 py-2 px-6 bg-white/80 backdrop-blur-xl border-t border-slate-50 flex items-center justify-between z-40 text-[9px] font-bold uppercase tracking-[0.2em] text-slate-300">
        <div className="flex gap-6">
          <span className="flex items-center gap-2"><div className="w-1 h-1 rounded-full bg-teal-500 shadow-[0_0_10px_rgba(20,184,166,0.6)]" /> Online</span>
          <span className="hidden sm:inline">Security: High-grade</span>
        </div>
        <div className="text-brand-accent opacity-60">2026 #JuaraVibeCoding</div>
      </footer>
    </div>
  );
}
