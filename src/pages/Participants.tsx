import React from "react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { participantsApi } from "@/lib/api";
import { toast } from "sonner";
import { 
  Plus, 
  Search, 
  Download, 
  CheckCircle2, 
  MoreVertical,
  QrCode as QrIcon,
  FileSpreadsheet,
  Filter,
  ArrowUpDown,
  UserPlus
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";

export default function Participants() {
  const [participants, setParticipants] = React.useState<any[]>([]);
  const [search, setSearch] = React.useState("");
  const [isAddModalOpen, setIsAddModalOpen] = React.useState(false);
  const [selectedParticipant, setSelectedParticipant] = React.useState<any>(null);
  const [isQrModalOpen, setIsQrModalOpen] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(true);

  const [formData, setFormData] = React.useState({
    nisn: "",
    name: "",
    email: "",
    class: "",
    field: "Skill Development"
  });

  const fetchParticipants = async () => {
    setIsLoading(true);
    try {
      const data = await participantsApi.getAll();
      setParticipants(data);
    } catch (err) {
      toast.error("Gagal mengambil data peserta");
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    fetchParticipants();
  }, []);

  const handleAddParticipant = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await participantsApi.create(formData);
      toast.success("Peserta berhasil ditambahkan");
      setIsAddModalOpen(false);
      setFormData({ nisn: "", name: "", email: "", class: "", field: "Skill Development" });
      fetchParticipants();
    } catch (err) {
      toast.error("Gagal menambahkan peserta");
    }
  };

  const handleConfirm = async (id: string) => {
    try {
      await participantsApi.confirm(id);
      toast.success("Peserta dikonfirmasi");
      fetchParticipants();
    } catch (err) {
      toast.error("Gagal mengonfirmasi peserta");
    }
  };

  const downloadQR = (nisn: string, name: string) => {
    const svg = document.getElementById(`qr-${nisn}`);
    if (!svg) return;
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx?.drawImage(img, 0, 0);
      const pngFile = canvas.toDataURL("image/png");
      const downloadLink = document.createElement("a");
      downloadLink.download = `QR_${nisn}_${name}.png`;
      downloadLink.href = `${pngFile}`;
      downloadLink.click();
    };
    img.src = `data:image/svg+xml;base64,${btoa(svgData)}`;
  };

  const filteredParticipants = participants.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) || 
    p.nisn.includes(search)
  );

  return (
    <div className="space-y-8">
      {/* Header Actions */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 font-display">Manajemen Peserta</h2>
          <p className="text-slate-500 text-sm mt-1">Kelola data peserta dan generate QR Code absensi.</p>
        </div>
        
        <div className="flex items-center space-x-3">
          <Button variant="outline" className="rounded-xl border-slate-200 bg-white shadow-sm hover:bg-slate-50">
            <Filter size={18} className="mr-2 text-slate-400" />
            Filter
          </Button>
          <Button variant="outline" className="rounded-xl border-slate-200 bg-white shadow-sm hover:bg-slate-50">
            <FileSpreadsheet size={18} className="mr-2 text-success" />
            Export Excel
          </Button>
          
          <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
            <DialogTrigger render={
              <Button className="bg-primary hover:bg-primary-hover text-white rounded-xl shadow-lg shadow-primary/20">
                <UserPlus size={18} className="mr-2" />
                Tambah Peserta
              </Button>
            } />
            <DialogContent className="sm:max-w-[450px] rounded-3xl">
              <DialogHeader>
                <DialogTitle className="text-xl font-bold font-display">Tambah Peserta Baru</DialogTitle>
                <DialogDescription>
                  Lengkapi data peserta di bawah ini. QR Code akan digenerate otomatis.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleAddParticipant} className="space-y-5 py-4">
                <div className="space-y-2">
                  <Label htmlFor="nisn" className="text-sm font-bold text-slate-700">NISN</Label>
                  <Input 
                    id="nisn" 
                    className="google-input" 
                    value={formData.nisn}
                    onChange={(e) => setFormData({...formData, nisn: e.target.value})}
                    required 
                    placeholder="Contoh: 12345678"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-bold text-slate-700">Nama Lengkap</Label>
                  <Input 
                    id="name" 
                    className="google-input" 
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    required 
                    placeholder="Nama lengkap peserta"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-bold text-slate-700">Email</Label>
                    <Input 
                      id="email" 
                      type="email" 
                      className="google-input" 
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      required 
                      placeholder="email@contoh.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="class" className="text-sm font-bold text-slate-700">Kelas</Label>
                    <Input 
                      id="class" 
                      className="google-input" 
                      value={formData.class}
                      onChange={(e) => setFormData({...formData, class: e.target.value})}
                      required 
                      placeholder="Contoh: XII-IPA 1"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="field" className="text-sm font-bold text-slate-700">Bidang Keahlian</Label>
                  <Select 
                    value={formData.field} 
                    onValueChange={(v) => setFormData({...formData, field: v})}
                  >
                    <SelectTrigger className="google-input w-full">
                      <SelectValue placeholder="Pilih Bidang" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      <SelectItem value="Skill Development">Skill Development</SelectItem>
                      <SelectItem value="Design">Design</SelectItem>
                      <SelectItem value="Data Analyst">Data Analyst</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <DialogFooter className="pt-4">
                  <Button type="submit" className="w-full bg-primary hover:bg-primary-hover rounded-xl py-6 text-base font-bold">Simpan Peserta</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Spreadsheet Style Table */}
      <div className="google-card overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <Input 
              placeholder="Cari berdasarkan nama atau NISN..." 
              className="pl-11 bg-white border-slate-200 rounded-xl focus:ring-primary/20 focus:border-primary"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex items-center space-x-2 text-slate-400 text-xs font-bold uppercase tracking-widest ml-4">
            <span className="hidden sm:inline">Total: {filteredParticipants.length} Peserta</span>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-50/80">
              <TableRow className="hover:bg-transparent border-b border-slate-200">
                <TableHead className="w-[120px] font-bold text-slate-500 py-4 pl-6">
                  <div className="flex items-center space-x-1 cursor-pointer hover:text-primary transition-colors">
                    <span>NISN</span>
                    <ArrowUpDown size={12} />
                  </div>
                </TableHead>
                <TableHead className="font-bold text-slate-500 py-4">
                  <div className="flex items-center space-x-1 cursor-pointer hover:text-primary transition-colors">
                    <span>NAMA LENGKAP</span>
                    <ArrowUpDown size={12} />
                  </div>
                </TableHead>
                <TableHead className="font-bold text-slate-500 py-4">KELAS</TableHead>
                <TableHead className="font-bold text-slate-500 py-4">BIDANG</TableHead>
                <TableHead className="font-bold text-slate-500 py-4">STATUS</TableHead>
                <TableHead className="text-right font-bold text-slate-500 py-4 pr-6">AKSI</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i} className="animate-pulse">
                    <TableCell colSpan={6} className="py-6 px-6">
                      <div className="h-4 bg-slate-100 rounded-full w-full"></div>
                    </TableCell>
                  </TableRow>
                ))
              ) : filteredParticipants.length > 0 ? (
                filteredParticipants.map((p, idx) => (
                  <motion.tr 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.03 }}
                    key={p.id} 
                    className="group hover:bg-primary/[0.02] transition-colors border-b border-slate-100 last:border-0"
                  >
                    <TableCell className="py-4 pl-6 font-mono text-xs font-medium text-slate-500">{p.nisn}</TableCell>
                    <TableCell className="py-4">
                      <div className="flex items-center space-x-3">
                        <div className="h-9 w-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 font-bold text-xs group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                          {p.name[0]}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-900 text-sm">{p.name}</span>
                          <span className="text-[11px] text-slate-400 font-medium">{p.email}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="py-4 font-medium text-slate-600 text-sm">{p.class}</TableCell>
                    <TableCell className="py-4">
                      <Badge variant="secondary" className="bg-slate-100 text-slate-600 border-none font-bold text-[10px] uppercase tracking-tighter px-2 py-0.5">
                        {p.field}
                      </Badge>
                    </TableCell>
                    <TableCell className="py-4">
                      {p.confirmed ? (
                        <div className="flex items-center space-x-1.5 text-success">
                          <CheckCircle2 size={14} />
                          <span className="text-[11px] font-bold uppercase tracking-tight">Verified</span>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-1.5 text-slate-400">
                          <div className="w-1.5 h-1.5 rounded-full bg-slate-300"></div>
                          <span className="text-[11px] font-bold uppercase tracking-tight">Pending</span>
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="py-4 pr-6 text-right">
                      <div className="flex justify-end items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {!p.confirmed && (
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-8 text-success hover:bg-success/10 rounded-lg font-bold text-xs"
                            onClick={() => handleConfirm(p.id)}
                          >
                            Verify
                          </Button>
                        )}
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-slate-400 hover:text-primary hover:bg-primary/10 rounded-lg"
                          onClick={() => {
                            setSelectedParticipant(p);
                            setIsQrModalOpen(true);
                          }}
                        >
                          <QrIcon size={16} />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:bg-slate-100 rounded-lg">
                          <MoreVertical size={16} />
                        </Button>
                      </div>
                    </TableCell>
                  </motion.tr>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="py-20 text-center">
                    <div className="flex flex-col items-center space-y-3">
                      <div className="p-4 bg-slate-50 rounded-full">
                        <Search className="text-slate-300" size={32} />
                      </div>
                      <p className="text-slate-400 font-medium italic">Tidak ada data peserta ditemukan</p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* QR Modal */}
      <Dialog open={isQrModalOpen} onOpenChange={setIsQrModalOpen}>
        <DialogContent className="sm:max-w-[380px] rounded-3xl p-0 overflow-hidden border-none shadow-2xl">
          <div className="bg-primary p-8 flex flex-col items-center text-white">
            <div className="bg-white p-4 rounded-3xl shadow-xl mb-6">
              {selectedParticipant && (
                <QRCodeSVG 
                  id={`qr-${selectedParticipant.nisn}`}
                  value={selectedParticipant.qrCode} 
                  size={200}
                  level="H"
                  includeMargin={true}
                />
              )}
            </div>
            <DialogTitle className="text-2xl font-bold font-display text-center">QR Code Absensi</DialogTitle>
            <DialogDescription className="text-primary-foreground/80 text-center mt-1">
              Scan kode ini untuk mencatat kehadiran
            </DialogDescription>
          </div>
          
          {selectedParticipant && (
            <div className="p-8 bg-white space-y-6">
              <div className="text-center space-y-1">
                <h4 className="font-bold text-xl text-slate-900">{selectedParticipant.name}</h4>
                <p className="text-sm text-slate-500 font-medium">{selectedParticipant.nisn} • {selectedParticipant.class}</p>
                <Badge className="mt-2 bg-slate-100 text-slate-500 border-none font-bold uppercase tracking-widest text-[10px]">
                  {selectedParticipant.field}
                </Badge>
              </div>
              
              <div className="flex flex-col space-y-3">
                <Button 
                  className="w-full bg-primary hover:bg-primary-hover rounded-2xl py-6 font-bold shadow-lg shadow-primary/20" 
                  onClick={() => downloadQR(selectedParticipant.nisn, selectedParticipant.name)}
                >
                  <Download size={18} className="mr-2" />
                  Download PNG
                </Button>
                <Button 
                  variant="ghost"
                  className="w-full rounded-2xl text-slate-400 font-bold" 
                  onClick={() => setIsQrModalOpen(false)}
                >
                  Tutup
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
