import React from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { attendanceApi } from "@/lib/api";
import { toast } from "sonner";
import { 
  Camera, 
  History, 
  CheckCircle2, 
  AlertCircle,
  RefreshCw
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "motion/react";

export default function Scanner() {
  const [lastScanned, setLastScanned] = React.useState<any>(null);
  const [history, setHistory] = React.useState<any[]>([]);
  const [isScanning, setIsScanning] = React.useState(false);

  React.useEffect(() => {
    const scanner = new Html5QrcodeScanner(
      "reader",
      { fps: 10, qrbox: { width: 250, height: 250 } },
      /* verbose= */ false
    );

    scanner.render(onScanSuccess, onScanFailure);

    function onScanSuccess(decodedText: string) {
      handleScan(decodedText);
    }

    function onScanFailure(error: any) {
      // console.warn(`Code scan error = ${error}`);
    }

    return () => {
      scanner.clear().catch(error => console.error("Failed to clear scanner", error));
    };
  }, []);

  const handleScan = async (qrCode: string) => {
    if (isScanning) return;
    setIsScanning(true);
    
    try {
      const result = await attendanceApi.scan(qrCode);
      setLastScanned({ ...result.participant, status: "success" });
      setHistory(prev => [result.participant, ...prev].slice(0, 10));
      toast.success(`Berhasil: ${result.participant.name} hadir`);
      
      // Reset last scanned after 3 seconds
      setTimeout(() => setLastScanned(null), 3000);
    } catch (err: any) {
      setLastScanned({ status: "error", message: err.message });
      toast.error(err.message || "Gagal melakukan absensi");
      setTimeout(() => setLastScanned(null), 3000);
    } finally {
      // Delay next scan
      setTimeout(() => setIsScanning(false), 2000);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Scanner Section */}
      <div className="space-y-6">
        <Card className="border-none shadow-sm overflow-hidden">
          <CardHeader className="bg-slate-900 text-white flex flex-row items-center justify-between">
            <CardTitle className="text-lg flex items-center">
              <Camera size={20} className="mr-2" />
              Scanner Kamera
            </CardTitle>
            {isScanning && (
              <Badge className="bg-blue-500 animate-pulse border-none">Memproses...</Badge>
            )}
          </CardHeader>
          <CardContent className="p-0 bg-slate-100 aspect-square relative">
            <div id="reader" className="w-full h-full"></div>
            
            {/* Overlay for Last Result */}
            <AnimatePresence>
              {lastScanned && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="absolute inset-0 z-10 flex items-center justify-center p-6 bg-black/40 backdrop-blur-sm"
                >
                  <div className={cn(
                    "w-full max-w-xs p-6 rounded-2xl shadow-2xl flex flex-col items-center text-center",
                    lastScanned.status === "success" ? "bg-white" : "bg-red-50"
                  )}>
                    {lastScanned.status === "success" ? (
                      <>
                        <div className="h-16 w-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-4">
                          <CheckCircle2 size={32} />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900">{lastScanned.name}</h3>
                        <p className="text-slate-500 mb-2">{lastScanned.nisn}</p>
                        <Badge className="bg-blue-50 text-blue-600 border-none">{lastScanned.time}</Badge>
                      </>
                    ) : (
                      <>
                        <div className="h-16 w-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-4">
                          <AlertCircle size={32} />
                        </div>
                        <h3 className="text-xl font-bold text-red-900">Gagal</h3>
                        <p className="text-red-600">{lastScanned.message}</p>
                      </>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>
        
        <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 flex items-start space-x-3">
          <div className="p-2 bg-blue-100 rounded-lg text-blue-600 shrink-0">
            <RefreshCw size={20} />
          </div>
          <div>
            <h4 className="font-semibold text-blue-900 text-sm">Tips Scanning</h4>
            <p className="text-blue-700 text-xs leading-relaxed">
              Pastikan QR Code berada di tengah kotak scanner dan pencahayaan cukup terang untuk hasil maksimal.
            </p>
          </div>
        </div>
      </div>

      {/* History Section */}
      <Card className="border-none shadow-sm">
        <CardHeader className="border-b border-slate-100">
          <CardTitle className="text-lg flex items-center">
            <History size={20} className="mr-2 text-slate-400" />
            Riwayat Absensi Hari Ini
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-slate-100">
            {history.length > 0 ? (
              history.map((item, idx) => (
                <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  key={item.id} 
                  className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <div className="h-10 w-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                      {item.name[0]}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{item.name}</p>
                      <p className="text-xs text-slate-500">{item.nisn} • {item.class}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-blue-600">{item.time}</p>
                    <p className="text-[10px] text-slate-400 uppercase tracking-wider">Terekam</p>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="p-12 text-center text-slate-400 italic text-sm">
                Belum ada data absensi yang terekam
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(" ");
}
