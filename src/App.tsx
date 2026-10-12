import { useState, useEffect, useId } from 'react';
import { marked } from 'marked';
import {
  GraduationCap,
  Sparkles,
  BookOpen,
  Route,
  Target,
  CalendarDays,
  TableCellsMerge,
  Copy,
  FileDown,
  Printer,
  Bookmark,
  Send,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  FolderOpen,
  X,
  ChevronRight,
  ShieldCheck,
  Cpu,
  School,
  User,
  Clock,
  Layers,
} from 'lucide-react';

interface Preset {
  label: string;
  mapel: string;
  fase: string;
  semester: string;
  alokasi: string;
  topik: string;
  model: string;
}

interface Draft {
  id: number;
  date: string;
  docType: string;
  title: string;
  markdown: string;
}

const PRESETS: Preset[] = [
  {
    label: 'Informatika X - Analisis Data & Berpikir Komputasional',
    mapel: 'Informatika',
    fase: 'Fase E (Kelas X SMA)',
    semester: '1 (Ganjil)',
    alokasi: '4 x 45 menit (2 Pertemuan)',
    topik: 'Berpikir Komputasional & Analisis Data: Pengolahan Lembar Kerja dan Visualisasi Grafis',
    model: 'Deep Learning / Pembelajaran Mendalam (Mindful, Meaningful, Joyful Learning)',
  },
  {
    label: 'Biologi X - Keanekaragaman Hayati',
    mapel: 'Biologi',
    fase: 'Fase E (Kelas X SMA)',
    semester: '2 (Genap)',
    alokasi: '6 x 45 menit (3 Pertemuan)',
    topik: 'Keanekaragaman Hayati Indonesia, Ancaman Kerusakan, dan Solusi Pelestarian Lingkungan',
    model: 'Project Based Learning (PjBL) terintegrasi Pembelajaran Berdiferensiasi',
  },
  {
    label: 'Matematika XI - Matriks & Transformasi',
    mapel: 'Matematika',
    fase: 'Fase F (Kelas XI SMA)',
    semester: '1 (Ganjil)',
    alokasi: '8 x 45 menit (4 Pertemuan)',
    topik: 'Operasi Aljabar Matriks, Determinan, Invers, dan Penerapan Solusi SPLTV',
    model: 'Problem Based Learning (PBL)',
  },
  {
    label: 'Bahasa Indonesia X - Teks LHO',
    mapel: 'Bahasa Indonesia',
    fase: 'Fase E (Kelas X SMA)',
    semester: '1 (Ganjil)',
    alokasi: '4 x 45 menit (2 Pertemuan)',
    topik: 'Menganalisis Struktur & Kaidah Kebahasaan Teks Laporan Hasil Observasi (LHO) Objektif',
    model: 'Discovery / Inquiry Learning',
  },
  {
    label: 'Fisika XII - Arus Bolak-Balik (AC)',
    mapel: 'Fisika',
    fase: 'Fase F (Kelas XII SMA)',
    semester: '1 (Ganjil)',
    alokasi: '6 x 45 menit (3 Pertemuan)',
    topik: 'Rangkaian RLC Arus Bolak-Balik, Resonansi Frekuensi, dan Penerapan Teknologi Transmisi',
    model: 'Problem Based Learning (PBL)',
  },
  {
    label: 'Kimia XI - Termokimia & Energi',
    mapel: 'Kimia',
    fase: 'Fase F (Kelas XI SMA)',
    semester: '1 (Ganjil)',
    alokasi: '6 x 45 menit (3 Pertemuan)',
    topik: 'Perubahan Entalpi Reaksi Kimia, Kalorimetri, dan Hukum Hess Terapan',
    model: 'Project Based Learning (PjBL) terintegrasi Pembelajaran Berdiferensiasi',
  },
];

const P3_OPTIONS = [
  'Beriman, Bertaqwa kepada Tuhan YME, dan Berakhlak Mulia',
  'Bernalar Kritis',
  'Kreatif',
  'Gotong Royong',
  'Mandiri',
  'Berkebinekaan Global',
];

export default function App() {
  const mapelInputId = useId();
  const faseInputId = useId();
  const semesterInputId = useId();
  const alokasiInputId = useId();
  const topikInputId = useId();
  const modelInputId = useId();
  const sekolahInputId = useId();
  const guruInputId = useId();
  const kepalaSekolahInputId = useId();
  const refineInputId = useId();

  // Form states
  const [mapel, setMapel] = useState('Informatika');
  const [fase, setFase] = useState('Fase E (Kelas X SMA)');
  const [semester, setSemester] = useState('1 (Ganjil)');
  const [alokasi, setAlokasi] = useState('4 x 45 menit (2 Pertemuan)');
  const [topik, setTopik] = useState('Berpikir Komputasional & Analisis Data: Pengolahan Lembar Kerja dan Visualisasi Grafis');
  const [model, setModel] = useState('Deep Learning / Pembelajaran Mendalam (Mindful, Meaningful, Joyful Learning)');
  const [sekolah, setSekolah] = useState('SMA Negeri 1');
  const [guru, setGuru] = useState('Shiddiq, S.Pd.');
  const [kepalaSekolah, setKepalaSekolah] = useState('Drs. H. Mulyadi, M.Pd.');
  const [selectedP3, setSelectedP3] = useState<string[]>([
    'Bernalar Kritis',
    'Kreatif',
    'Gotong Royong',
    'Mandiri',
  ]);

  // Document states
  const [activeDocType, setActiveDocType] = useState<'MA' | 'ATP' | 'CP' | 'PROTA' | 'PROSEM'>('MA');
  const [generatedMarkdown, setGeneratedMarkdown] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('Siap membuat dokumen');
  const [refineInstruction, setRefineInstruction] = useState('');
  const [isRefining, setIsRefining] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  // Drafts & Backend status
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [isDraftsModalOpen, setIsDraftsModalOpen] = useState(false);
  const [serverStatus, setServerStatus] = useState<{ connected: boolean; model: string }>({
    connected: true,
    model: 'gemini-3.8-flash',
  });

  // Check health on mount and load drafts
  useEffect(() => {
    fetch('/api/health')
      .then((res) => res.json())
      .then((data) => {
        if (data.status === 'ok') {
          setServerStatus({
            connected: true,
            model: data.model || 'gemini-3.8-flash',
          });
        }
      })
      .catch(() => {
        setServerStatus({
          connected: false,
          model: 'gemini-3.8-flash',
        });
      });

    try {
      const stored = localStorage.getItem('sma_doc_drafts');
      if (stored) {
        setDrafts(JSON.parse(stored));
      }
    } catch {
      // ignore
    }
  }, []);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 3500);
  };

  const handleP3Toggle = (item: string) => {
    setSelectedP3((prev) =>
      prev.includes(item) ? prev.filter((p) => p !== item) : [...prev, item]
    );
  };

  const handleApplyPreset = (preset: Preset) => {
    setMapel(preset.mapel);
    setFase(preset.fase);
    setSemester(preset.semester);
    setAlokasi(preset.alokasi);
    setTopik(preset.topik);
    setModel(preset.model);
    showToast(`Preset "${preset.label.slice(0, 30)}..." diterapkan!`, 'info');
  };

  const handleResetForm = () => {
    setMapel('');
    setTopik('');
    setAlokasi('4 x 45 menit (2 Pertemuan)');
    showToast('Form berhasil di-reset', 'info');
  };

  const handleGenerateDocument = async (type: 'MA' | 'ATP' | 'CP' | 'PROTA' | 'PROSEM') => {
    if (!mapel.trim() || !topik.trim()) {
      showToast('Harap isi Mata Pelajaran dan Topik/Materi!', 'error');
      return;
    }

    setActiveDocType(type);
    setIsLoading(true);
    setStatusMessage('Gemini AI sedang menyusun dokumen...');

    const p3Text = selectedP3.length > 0
      ? selectedP3.map((p, idx) => `${idx + 1}. ${p}`).join('\n')
      : '1. Bernalar Kritis\n2. Kreatif\n3. Mandiri';

    try {
      const response = await fetch('/api/generate-document', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          docType: type,
          mapel,
          fase,
          semester,
          alokasi,
          topik,
          model,
          sekolah,
          guru,
          kepalaSekolah,
          p3Text,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Gagal memproses dokumen');
      }

      setGeneratedMarkdown(data.markdown);
      setStatusMessage('Dokumen berhasil disusun!');
      showToast(`Dokumen ${getDocBadgeName(type)} berhasil dibuat!`, 'success');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Terjadi kendala jaringan';
      setStatusMessage('Gagal membuat dokumen');
      showToast(msg, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefineDocument = async (customPrompt?: string) => {
    const textToSubmit = customPrompt || refineInstruction.trim();
    if (!textToSubmit) {
      showToast('Masukkan instruksi perbaikan dokumen!', 'error');
      return;
    }

    if (!generatedMarkdown) {
      showToast('Buat dokumen terlebih dahulu sebelum menyempurnakan!', 'error');
      return;
    }

    setIsRefining(true);
    setStatusMessage('Gemini AI sedang menyempurnakan dokumen...');

    try {
      const response = await fetch('/api/refine-document', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          previousMarkdown: generatedMarkdown,
          instruction: textToSubmit,
          docType: activeDocType,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Gagal menyempurnakan dokumen');
      }

      setGeneratedMarkdown(data.markdown);
      setRefineInstruction('');
      setStatusMessage('Dokumen berhasil diperbarui!');
      showToast('Dokumen berhasil disempurnakan oleh Gemini AI!', 'success');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal menyempurnakan dokumen';
      setStatusMessage('Gagal memperbarui');
      showToast(msg, 'error');
    } finally {
      setIsRefining(false);
    }
  };

  const handleCopy = async () => {
    if (!generatedMarkdown) {
      showToast('Belum ada dokumen untuk disalin!', 'error');
      return;
    }
    try {
      await navigator.clipboard.writeText(generatedMarkdown);
      showToast('Dokumen Markdown berhasil disalin ke clipboard!', 'success');
    } catch {
      showToast('Gagal menyalin teks', 'error');
    }
  };

  const handleExportWord = () => {
    if (!generatedMarkdown) {
      showToast('Belum ada dokumen untuk diunduh!', 'error');
      return;
    }

    const htmlContent = marked.parse(generatedMarkdown) as string;
    const header = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
        <meta charset='utf-8'>
        <title>${activeDocType} - ${mapel} SMA</title>
        <style>
          body { font-family: Calibri, Arial, sans-serif; font-size: 11pt; line-height: 1.5; color: #111; }
          h1 { font-size: 18pt; color: #1e3a8a; border-bottom: 2px solid #3b82f6; padding-bottom: 4px; }
          h2 { font-size: 14pt; color: #1e293b; margin-top: 14pt; }
          h3 { font-size: 12pt; color: #334155; }
          table { border-collapse: collapse; width: 100%; margin-top: 10pt; margin-bottom: 10pt; }
          th, td { border: 1px solid #94a3b8; padding: 6pt 8pt; vertical-align: top; }
          th { background-color: #f1f5f9; font-weight: bold; }
          hr { border: 0; border-top: 1px solid #cbd5e1; margin: 15pt 0; }
        </style>
      </head>
      <body>
    `;
    const footer = '</body></html>';
    const sourceHTML = header + htmlContent + footer;

    const blob = new Blob(['\ufeff' + sourceHTML], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${activeDocType}_${mapel.replace(/\s+/g, '_')}_SMA.doc`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('File dokumen Word (.doc) berhasil diunduh!', 'success');
  };

  const handlePrint = () => {
    if (!generatedMarkdown) {
      showToast('Belum ada dokumen untuk dicetak!', 'error');
      return;
    }
    window.print();
  };

  const handleSaveDraft = () => {
    if (!generatedMarkdown) {
      showToast('Tidak ada dokumen untuk disimpan!', 'error');
      return;
    }

    const newDraft: Draft = {
      id: Date.now(),
      date: new Date().toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
      docType: activeDocType,
      title: `${activeDocType} - ${mapel} (${topik.slice(0, 32)}...)`,
      markdown: generatedMarkdown,
    };

    const updated = [newDraft, ...drafts.slice(0, 19)];
    setDrafts(updated);
    localStorage.setItem('sma_doc_drafts', JSON.stringify(updated));
    showToast('Draft berhasil disimpan di browser!', 'success');
  };

  const handleLoadDraft = (draft: Draft) => {
    setGeneratedMarkdown(draft.markdown);
    setActiveDocType(draft.docType as 'MA' | 'ATP' | 'CP' | 'PROTA' | 'PROSEM');
    setIsDraftsModalOpen(false);
    showToast(`Draft "${draft.title}" berhasil dimuat!`, 'info');
  };

  const handleDeleteDraft = (id: number) => {
    const updated = drafts.filter((d) => d.id !== id);
    setDrafts(updated);
    localStorage.setItem('sma_doc_drafts', JSON.stringify(updated));
    showToast('Draft berhasil dihapus', 'info');
  };

  const handleClearAllDrafts = () => {
    setDrafts([]);
    localStorage.removeItem('sma_doc_drafts');
    showToast('Semua draft telah dibersihkan', 'info');
  };

  const getDocBadgeName = (type: string) => {
    switch (type) {
      case 'MA':
        return 'Modul Ajar (MA)';
      case 'ATP':
        return 'Alur Tujuan (ATP)';
      case 'CP':
        return 'Capaian Pembelajaran (CP)';
      case 'PROTA':
        return 'Program Tahunan (PROTA)';
      case 'PROSEM':
        return 'Program Semester (PROSEM)';
      default:
        return 'Dokumen Kurikulum';
    }
  };

  const quickRefinePills = [
    'Tambahkan asesmen diagnostik kognitif & non-kognitif detail',
    'Perinci rubrik penilaian unjuk kerja skala 1-4 lengkap dengan deskriptor',
    'Tambahkan strategi diferensiasi konten, proses, dan produk',
    'Perdalam kegiatan inti dengan 5 sintaks pembelajaran mendalam (Deep Learning)',
  ];

  return (
    <div className="bg-slate-50 text-slate-800 min-h-screen flex flex-col font-sans">
      {/* Top Navigation */}
      <header className="bg-slate-900 text-white shadow-lg sticky top-0 z-40 no-print border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-wrap justify-between items-center gap-3">
          <div className="flex items-center space-x-3">
            <div className="bg-indigo-600 p-2.5 rounded-xl shadow-md text-white flex items-center justify-center">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-bold tracking-tight leading-tight">
                  PerangkatAjar.AI SMA
                </h1>
                <span className="hidden sm:inline-flex items-center gap-1 text-[10px] bg-indigo-950 text-indigo-300 font-semibold px-2 py-0.5 rounded-full border border-indigo-700/50">
                  <ShieldCheck className="w-3 h-3 text-indigo-400" />
                  Kurikulum Merdeka 2026
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Standar Resmi Kemendikbudristek • Permendikbudristek No. 12/2024 & BSKAP
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2.5">
            {/* Real Gemini Connection Indicator */}
            <div
              className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border font-medium ${
                serverStatus.connected
                  ? 'bg-emerald-950/70 text-emerald-300 border-emerald-700/60'
                  : 'bg-amber-950/70 text-amber-300 border-amber-700/60'
              }`}
              title="Terhubung langsung via Server-side Google Gemini SDK"
            >
              <Cpu className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
              <span>Gemini AI Aktif ({serverStatus.model})</span>
            </div>

            <button
              onClick={() => setIsDraftsModalOpen(true)}
              className="flex items-center space-x-1.5 text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white px-3 py-1.5 rounded-lg transition border border-slate-700 shadow-sm"
            >
              <FolderOpen className="w-3.5 h-3.5 text-indigo-400" />
              <span>Draft ({drafts.length})</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Workspace */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-grow w-full grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Form Panel */}
        <div className="lg:col-span-5 space-y-5 no-print">
          {/* Kemendikbudristek Compliance Badge */}
          <div className="bg-gradient-to-r from-indigo-900 via-blue-900 to-slate-900 text-white p-3.5 rounded-xl shadow-sm text-xs flex items-start gap-3 border border-indigo-700/40">
            <div className="bg-white/10 p-2 rounded-lg shrink-0 mt-0.5 text-amber-300">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div className="leading-relaxed">
              <span className="font-bold text-amber-300 block mb-0.5">
                Standar Kurikulum Merdeka Terintegrasi
              </span>
              <p className="text-[11px] text-slate-200">
                Penyusunan selaras dengan <b>Permendikbudristek No. 12 Tahun 2024</b>, Keputusan BSKAP mengenai Capaian Pembelajaran, serta <b>Panduan Pembelajaran & Asesmen (PPA)</b> SMA.
              </p>
            </div>
          </div>

          {/* Quick Subject Presets */}
          <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                Preset Contoh Mapel SMA
              </label>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {PRESETS.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => handleApplyPreset(p)}
                  className="text-[11px] bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-300 text-slate-700 px-2.5 py-1.5 rounded-lg transition border border-slate-200 text-left"
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Main Parameters Form */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 space-y-4">
            <div className="border-b border-slate-100 pb-3 flex justify-between items-center">
              <h2 className="font-bold text-slate-800 text-sm sm:text-base flex items-center gap-2">
                <Layers className="w-4 h-4 text-indigo-600" />
                Form Parameter Pembelajaran
              </h2>
              <button
                onClick={handleResetForm}
                className="text-xs text-slate-400 hover:text-rose-600 transition flex items-center gap-1"
                title="Reset parameter form"
              >
                <RotateCcw className="w-3 h-3" /> Reset
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2 sm:col-span-1">
                <label htmlFor={mapelInputId} className="block text-xs font-medium text-slate-700 mb-1">
                  Mata Pelajaran (Mapel)
                </label>
                <input
                  id={mapelInputId}
                  type="text"
                  value={mapel}
                  onChange={(e) => setMapel(e.target.value)}
                  placeholder="Contoh: Biologi, Informatika, Fisika..."
                  className="w-full text-sm p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition bg-slate-50/50 focus:bg-white"
                />
              </div>

              <div className="col-span-2 sm:col-span-1">
                <label htmlFor={faseInputId} className="block text-xs font-medium text-slate-700 mb-1">
                  Fase / Kelas
                </label>
                <select
                  id={faseInputId}
                  value={fase}
                  onChange={(e) => setFase(e.target.value)}
                  className="w-full text-sm p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition bg-white"
                >
                  <option value="Fase E (Kelas X SMA)">Fase E (Kelas X SMA)</option>
                  <option value="Fase F (Kelas XI SMA)">Fase F (Kelas XI SMA)</option>
                  <option value="Fase F (Kelas XII SMA)">Fase F (Kelas XII SMA)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor={semesterInputId} className="block text-xs font-medium text-slate-700 mb-1">
                  Semester
                </label>
                <select
                  id={semesterInputId}
                  value={semester}
                  onChange={(e) => setSemester(e.target.value)}
                  className="w-full text-sm p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition bg-white"
                >
                  <option value="1 (Ganjil)">Semester 1 (Ganjil)</option>
                  <option value="2 (Genap)">Semester 2 (Genap)</option>
                  <option value="1 dan 2 (Tahunan)">Satu Tahun Penuh</option>
                </select>
              </div>

              <div>
                <label htmlFor={alokasiInputId} className="block text-xs font-medium text-slate-700 mb-1 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-slate-400" /> Alokasi Waktu
                </label>
                <input
                  id={alokasiInputId}
                  type="text"
                  value={alokasi}
                  onChange={(e) => setAlokasi(e.target.value)}
                  placeholder="Contoh: 4 x 45 menit (2 Pertemuan)"
                  className="w-full text-sm p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition bg-slate-50/50 focus:bg-white"
                />
              </div>
            </div>

            <div>
              <label htmlFor={topikInputId} className="block text-xs font-medium text-slate-700 mb-1">
                Elemen / Topik Utama / Bab Pembelajaran
              </label>
              <textarea
                id={topikInputId}
                rows={2}
                value={topik}
                onChange={(e) => setTopik(e.target.value)}
                placeholder="Contoh: Berpikir Komputasional, Keanekaragaman Hayati, Dinamika Partikel..."
                className="w-full text-sm p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition bg-slate-50/50 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Profil Pelajar Pancasila (P3)
              </label>
              <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                {P3_OPTIONS.map((item) => (
                  <label key={item} className="flex items-center space-x-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={selectedP3.includes(item)}
                      onChange={() => handleP3Toggle(item)}
                      className="rounded text-indigo-600 focus:ring-indigo-500 w-3.5 h-3.5"
                    />
                    <span className="truncate">{item}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2 sm:col-span-1">
                <label htmlFor={modelInputId} className="block text-xs font-medium text-slate-700 mb-1">
                  Model Pembelajaran
                </label>
                <select
                  id={modelInputId}
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  className="w-full text-sm p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition bg-white"
                >
                  <option value="Deep Learning / Pembelajaran Mendalam (Mindful, Meaningful, Joyful Learning)">
                    Deep Learning (Mindful & Meaningful)
                  </option>
                  <option value="Project Based Learning (PjBL) terintegrasi Pembelajaran Berdiferensiasi">
                    Project Based Learning (PjBL)
                  </option>
                  <option value="Problem Based Learning (PBL)">
                    Problem Based Learning (PBL)
                  </option>
                  <option value="Discovery / Inquiry Learning">
                    Discovery / Inquiry Learning
                  </option>
                  <option value="Cooperative Learning Tipe STAD / Jigsaw">
                    Cooperative Learning
                  </option>
                </select>
              </div>

              <div className="col-span-2 sm:col-span-1">
                <label htmlFor={sekolahInputId} className="block text-xs font-medium text-slate-700 mb-1 flex items-center gap-1">
                  <School className="w-3 h-3 text-slate-400" /> Satuan Pendidikan
                </label>
                <input
                  id={sekolahInputId}
                  type="text"
                  value={sekolah}
                  onChange={(e) => setSekolah(e.target.value)}
                  placeholder="Contoh: SMA Negeri 1..."
                  className="w-full text-sm p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition bg-slate-50/50 focus:bg-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor={guruInputId} className="block text-xs font-medium text-slate-700 mb-1 flex items-center gap-1">
                  <User className="w-3 h-3 text-slate-400" /> Guru Penyusun
                </label>
                <input
                  id={guruInputId}
                  type="text"
                  value={guru}
                  onChange={(e) => setGuru(e.target.value)}
                  placeholder="Nama Guru & Gelar"
                  className="w-full text-sm p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition bg-slate-50/50 focus:bg-white"
                />
              </div>

              <div>
                <label htmlFor={kepalaSekolahInputId} className="block text-xs font-medium text-slate-700 mb-1">
                  Kepala Sekolah (Pengesahan)
                </label>
                <input
                  id={kepalaSekolahInputId}
                  type="text"
                  value={kepalaSekolah}
                  onChange={(e) => setKepalaSekolah(e.target.value)}
                  placeholder="Nama Kepala Sekolah"
                  className="w-full text-sm p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition bg-slate-50/50 focus:bg-white"
                />
              </div>
            </div>

            {/* Document Selection Buttons */}
            <div className="pt-2">
              <label className="block text-xs font-bold text-slate-700 mb-2">
                Pilih Dokumen yang Ingin Dihasilkan dengan Gemini AI:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <button
                  disabled={isLoading}
                  onClick={() => handleGenerateDocument('MA')}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium p-2.5 rounded-lg text-xs flex items-center justify-center gap-2 transition shadow-sm disabled:opacity-50"
                >
                  <BookOpen className="w-4 h-4" />
                  <span>Modul Ajar (MA) Lengkap</span>
                </button>

                <button
                  disabled={isLoading}
                  onClick={() => handleGenerateDocument('ATP')}
                  className="bg-slate-800 hover:bg-slate-900 text-white font-medium p-2.5 rounded-lg text-xs flex items-center justify-center gap-2 transition shadow-sm disabled:opacity-50"
                >
                  <Route className="w-4 h-4" />
                  <span>Alur Tujuan (ATP)</span>
                </button>

                <button
                  disabled={isLoading}
                  onClick={() => handleGenerateDocument('CP')}
                  className="bg-slate-800 hover:bg-slate-900 text-white font-medium p-2.5 rounded-lg text-xs flex items-center justify-center gap-2 transition shadow-sm disabled:opacity-50"
                >
                  <Target className="w-4 h-4" />
                  <span>Capaian Pembelajaran (CP)</span>
                </button>

                <button
                  disabled={isLoading}
                  onClick={() => handleGenerateDocument('PROTA')}
                  className="bg-slate-800 hover:bg-slate-900 text-white font-medium p-2.5 rounded-lg text-xs flex items-center justify-center gap-2 transition shadow-sm disabled:opacity-50"
                >
                  <CalendarDays className="w-4 h-4" />
                  <span>Program Tahunan (PROTA)</span>
                </button>

                <button
                  disabled={isLoading}
                  onClick={() => handleGenerateDocument('PROSEM')}
                  className="bg-slate-800 hover:bg-slate-900 text-white font-medium p-2.5 rounded-lg text-xs flex items-center justify-center gap-2 transition shadow-sm col-span-1 sm:col-span-2 disabled:opacity-50"
                >
                  <TableCellsMerge className="w-4 h-4" />
                  <span>Program Semester (PROSEM) Terdistribusi</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Output & Preview Panel */}
        <div className="lg:col-span-7 flex flex-col space-y-4">
          {/* Output Toolbar */}
          <div className="bg-white p-3 rounded-xl shadow-sm border border-slate-200 flex flex-wrap justify-between items-center gap-2 no-print">
            <div className="flex items-center space-x-2">
              <span className="bg-indigo-100 text-indigo-900 font-bold text-xs px-2.5 py-1 rounded-md flex items-center gap-1.5 border border-indigo-200">
                <BookOpen className="w-3.5 h-3.5 text-indigo-700" />
                {getDocBadgeName(activeDocType)}
              </span>
              <span className="text-xs text-slate-500 font-medium">
                {statusMessage}
              </span>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={handleCopy}
                disabled={!generatedMarkdown}
                title="Salin Dokumen"
                className="p-2 text-slate-700 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition text-xs flex items-center gap-1 disabled:opacity-40"
              >
                <Copy className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Salin</span>
              </button>

              <button
                onClick={handleExportWord}
                disabled={!generatedMarkdown}
                title="Unduh Microsoft Word"
                className="p-2 text-blue-700 hover:bg-blue-50 rounded-lg transition text-xs flex items-center gap-1 disabled:opacity-40"
              >
                <FileDown className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Word (.doc)</span>
              </button>

              <button
                onClick={handlePrint}
                disabled={!generatedMarkdown}
                title="Cetak / Simpan PDF"
                className="p-2 text-emerald-700 hover:bg-emerald-50 rounded-lg transition text-xs flex items-center gap-1 disabled:opacity-40"
              >
                <Printer className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Cetak / PDF</span>
              </button>

              <button
                onClick={handleSaveDraft}
                disabled={!generatedMarkdown}
                title="Simpan ke Draft Lokal"
                className="p-2 text-amber-700 hover:bg-amber-50 rounded-lg transition text-xs flex items-center gap-1 disabled:opacity-40"
              >
                <Bookmark className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Simpan</span>
              </button>
            </div>
          </div>

          {/* Printable Document Area */}
          <div
            id="printArea"
            className="printable-card bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex-grow min-h-[560px] flex flex-col relative overflow-hidden"
          >
            {/* Loading Indicator */}
            {isLoading && (
              <div className="absolute inset-0 bg-white/95 backdrop-blur-xs z-20 flex flex-col items-center justify-center p-6 text-center">
                <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
                <h3 className="font-bold text-slate-900 text-lg mb-1">
                  Gemini AI Sedang Menyusun Dokumen...
                </h3>
                <p className="text-xs text-slate-600 max-w-md leading-relaxed">
                  Menyelaraskan struktur perangkat ajar dengan Permendikbudristek No. 12/2024 dan Panduan Pembelajaran & Asesmen SMA...
                </p>
              </div>
            )}

            {/* Empty State */}
            {!generatedMarkdown && !isLoading && (
              <div className="my-auto text-center py-16 px-4">
                <div className="w-16 h-16 bg-indigo-50 border border-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-4 text-indigo-600">
                  <Sparkles className="w-7 h-7" />
                </div>
                <h3 className="text-base font-bold text-slate-800 mb-1">
                  Dokumen Belum Dibuat
                </h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto mb-4">
                  Pilih preset contoh atau sesuaikan formulir parameter di sebelah kiri, lalu klik tombol dokumen untuk menghasilkan perangkat ajar lengkap dengan Gemini AI.
                </p>
                <button
                  onClick={() => handleGenerateDocument('MA')}
                  className="inline-flex items-center gap-2 text-xs bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-4 py-2.5 rounded-lg shadow-sm transition"
                >
                  <BookOpen className="w-4 h-4" /> Buat Modul Ajar Sekarang
                </button>
              </div>
            )}

            {/* Rendered Document View */}
            {generatedMarkdown && (
              <div
                className="document-content text-sm leading-relaxed overflow-y-auto max-h-[750px] pr-2"
                dangerouslySetInnerHTML={{
                  __html: marked.parse(generatedMarkdown) as string,
                }}
              />
            )}
          </div>

          {/* AI Refine Bar */}
          {generatedMarkdown && (
            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 space-y-3 no-print">
              <div className="flex items-center justify-between">
                <label htmlFor={refineInputId} className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                  Minta Gemini AI Mempertajam / Mengedit Dokumen:
                </label>
              </div>

              {/* Quick Prompt Pills */}
              <div className="flex flex-wrap gap-1.5">
                {quickRefinePills.map((pill, idx) => (
                  <button
                    key={idx}
                    disabled={isRefining}
                    onClick={() => handleRefineDocument(pill)}
                    className="text-[11px] bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-700 px-2.5 py-1 rounded-md transition border border-slate-200 text-left disabled:opacity-50"
                  >
                    + {pill}
                  </button>
                ))}
              </div>

              <div className="flex gap-2">
                <input
                  id={refineInputId}
                  type="text"
                  disabled={isRefining}
                  value={refineInstruction}
                  onChange={(e) => setRefineInstruction(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleRefineDocument();
                  }}
                  placeholder="Ketik instruksi khusus (misal: buat asesmen diagnostik lebih rinci, tambahkan rubrik LKPD...)"
                  className="text-xs p-2.5 flex-grow rounded-lg border border-slate-300 outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50/50 focus:bg-white"
                />
                <button
                  disabled={isRefining || !refineInstruction.trim()}
                  onClick={() => handleRefineDocument()}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-xs font-medium transition flex items-center gap-1.5 shrink-0 disabled:opacity-50 shadow-sm"
                >
                  {isRefining ? (
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <Send className="w-3.5 h-3.5" />
                  )}
                  <span>Proses</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Drafts Modal */}
      {isDraftsModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-100 flex flex-col max-h-[80vh]">
            <div className="flex justify-between items-center mb-4 pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
                <FolderOpen className="w-5 h-5 text-indigo-600" />
                Draft Dokumen Tersimpan ({drafts.length})
              </h3>
              <button
                onClick={() => setIsDraftsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 overflow-y-auto flex-grow pr-1">
              {drafts.length === 0 ? (
                <div className="text-center py-12 text-slate-400">
                  <FolderOpen className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                  <p className="text-xs">Belum ada draft dokumen yang disimpan.</p>
                </div>
              ) : (
                drafts.map((d) => (
                  <div
                    key={d.id}
                    className="p-3 bg-slate-50 hover:bg-indigo-50/40 border border-slate-200 rounded-xl flex justify-between items-center gap-3 transition"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-indigo-900">
                          {d.title}
                        </span>
                        <span className="text-[10px] bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded font-mono">
                          {d.docType}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        Disimpan: {d.date}
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => handleLoadDraft(d)}
                        className="text-xs bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-lg flex items-center gap-1 font-medium transition"
                      >
                        <span>Buka</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteDraft(d.id)}
                        className="text-xs bg-rose-50 text-rose-600 hover:bg-rose-100 p-1.5 rounded-lg transition"
                        title="Hapus draft"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex justify-between items-center text-xs">
              {drafts.length > 0 ? (
                <button
                  onClick={handleClearAllDrafts}
                  className="text-rose-600 hover:underline"
                >
                  Hapus Semua Draft
                </button>
              ) : (
                <div></div>
              )}
              <button
                onClick={() => setIsDraftsModalOpen(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-700 font-medium"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notification Toast */}
      {toast && (
        <div className="fixed bottom-5 right-5 bg-slate-900 text-white text-xs px-4 py-3 rounded-xl shadow-xl z-50 flex items-center gap-2.5 border border-slate-700 animate-slide-up">
          {toast.type === 'error' ? (
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          ) : (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          )}
          <span>{toast.message}</span>
        </div>
      )}
    </div>
  );
}
