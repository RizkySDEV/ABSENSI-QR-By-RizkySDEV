import React from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { attendanceApi } from "@/lib/api";
import { toast } from "sonner";
import { 
  QrCode, 
  History, 
  CheckCircle2, 
  AlertCircle, 
  Camera,
  Info,
  Scan,
  Clock
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export default function Scanner() {
  const [lastScan, setLastScan] = React.useState<any>(null);
  const [history, setHistory] = React.useState<any[]>([]);
  const [isScanning, setIsScanning] = React.useState(false);

  React.useEffect(() => {
    const scanner = new Html5QrcodeScanner(
      "reader",
      { 
        fps: 10, 
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0
      },
      false
    );

    scanner.render(
      async (decodedText) => {
        if (isScanning) return;
        try {
          setIsScanning(true);
          const result = await attendanceApi.scan(decodedText);
          const participant = result.participant;
          setLastScan(participant);
          setHistory(prev => [participant, ...prev].slice(0, 5));
          toast.success(`Absensi berhasil: ${participant.name}`);
          
          // Play success sound if possible
          const audio = new Audio("https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3");
          audio.play().catch(() => {});
          
          // Reset last scan after 5 seconds
          setTimeout(() => setLastScan(null), 5000);
        } catch (err: any) {
          toast.error(err.message || "Gagal mencatat absensi");
        } finally {
          // Delay next scan
          setTimeout(() => setIsScanning(false), 2000);
        }
      },
      (error) => {
        // Silent error for scanner
      }
    );

    return () => {
      scanner.clear().catch(console.error);
    };
  }, []);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
      <div className="space-y-8">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 font-display tracking-tight">Scanner Absensi</h2>
          <p className="text-slate-500 mt-1">Arahkan QR Code ke kamera untuk mencatat kehadiran.</p>
        </div>

        <Card className="border-none shadow-2xl bg-white rounded-[2.5rem] overflow-hidden">
          <CardContent className="p-0 relative">
            <div id="reader" className="overflow-hidden"></div>
            
            {/* Scanner Overlay */}
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
              <div className="w-64 h-64 border-2 border-primary/50 rounded-3xl relative">
                <div className="absolute -top-1 -left-1 w-8 h-8 border-t-4 border-l-4 border-primary rounded-tl-xl"></div>
                <div className="absolute -top-1 -right-1 w-8 h-8 border-t-4 border-r-4 border-primary rounded-tr-xl"></div>
                <div className="absolute -bottom-1 -left-1 w-8 h-8 border-b-4 border-l-4 border-primary rounded-bl-xl"></div>
                <div className="absolute -bottom-1 -right-1 w-8 h-8 border-b-4 border-r-4 border-primary rounded-br-xl"></div>
                
                {/* Scanning Line */}
                <motion.div 
                  animate={{ top: ["0%", "100%", "0%"] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                  className="absolute left-0 right-0 h-0.5 bg-primary shadow-[0_0_15px_rgba(26,115,232,0.8)] z-10"
                />
              </div>
            </div>

            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center space-x-2 bg-black/50 backdrop-blur-md px-4 py-2 rounded-full text-white text-xs font-bold uppercase tracking-widest">
              <Scan size={14} className="animate-pulse" />
              <span>System Active</span>
            </div>
          </CardContent>
        </Card>

        <div className="google-card p-6 flex items-start space-x-4 bg-blue-50/50 border-blue-100">
          <div className="p-2 bg-blue-100 rounded-xl text-primary">
            <Info size={20} />
          </div>
          <div className="space-y-1">
            <h4 className="font-bold text-slate-900 text-sm">Tips Scanning</h4>
            <ul className="text-xs text-slate-500 space-y-1 list-disc pl-4 font-medium">
              <li>Pastikan pencahayaan ruangan cukup terang</li>
              <li>Jaga jarak QR Code sekitar 15-20cm dari kamera</li>
              <li>Pastikan QR Code tidak terlipat atau kotor</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="space-y-8">
        <Card className="border-none shadow-sm bg-white rounded-3xl overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-success/10 rounded-xl text-success">
                <CheckCircle2 size={20} />
              </div>
              <CardTitle className="text-xl font-bold font-display">Hasil Scan Terakhir</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <AnimatePresence mode="wait">
              {lastScan ? (
                <motion.div 
                  key={lastScan.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex items-center space-x-5 p-6 bg-success/5 rounded-[2rem] border border-success/10"
                >
                  <div className="h-16 w-16 rounded-2xl bg-white shadow-sm flex items-center justify-center text-success font-bold text-2xl border border-success/10">
                    {lastScan.name[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-success uppercase tracking-widest mb-1">Berhasil Absen</p>
                    <h4 className="text-xl font-bold text-slate-900 truncate">{lastScan.name}</h4>
                    <p className="text-sm text-slate-500 font-medium">{lastScan.nisn} • {lastScan.class}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-slate-900">{lastScan.time}</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">WIB</p>
                  </div>
                </motion.div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center space-y-4 border-2 border-dashed border-slate-100 rounded-[2rem]">
                  <div className="p-4 bg-slate-50 rounded-full">
                    <Camera className="text-slate-300" size={40} />
                  </div>
                  <div className="space-y-1">
                    <p className="text-slate-900 font-bold">Belum Ada Scan</p>
                    <p className="text-slate-400 text-sm max-w-[200px]">Data akan muncul di sini setelah Anda melakukan scan QR Code.</p>
                  </div>
                </div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-white rounded-3xl overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-slate-100 rounded-xl text-slate-500">
                <History size={20} />
              </div>
              <CardTitle className="text-xl font-bold font-display">Riwayat Sesi Ini</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="space-y-4">
              {history.length > 0 ? (
                history.map((item, idx) => (
                  <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    key={idx} 
                    className="flex items-center space-x-4 p-3 rounded-2xl hover:bg-slate-50 transition-colors group"
                  >
                    <div className="h-10 w-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-xs group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                      {item.name[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-slate-900 truncate">{item.name}</p>
                      <p className="text-[11px] text-slate-400 font-medium">{item.class}</p>
                    </div>
                    <div className="text-right flex flex-col items-end">
                      <div className="flex items-center space-x-1 text-primary">
                        <Clock size={12} />
                        <span className="text-xs font-bold">{item.time}</span>
                      </div>
                      <Badge className="mt-1 bg-success/10 text-success border-none text-[9px] px-1.5 py-0">HADIR</Badge>
                    </div>
                  </motion.div>
                ))
              ) : (
                <p className="text-center py-8 text-slate-400 text-sm italic">Belum ada riwayat scan</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
