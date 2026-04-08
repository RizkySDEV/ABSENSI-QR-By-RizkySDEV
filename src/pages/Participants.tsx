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
  QrCode as QrIcon
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";

export default function Participants() {
  const [participants, setParticipants] = React.useState<any[]>([]);
  const [search, setSearch] = React.useState("");
  const [isAddModalOpen, setIsAddModalOpen] = React.useState(false);
  const [selectedParticipant, setSelectedParticipant] = React.useState<any>(null);
  const [isQrModalOpen, setIsQrModalOpen] = React.useState(false);

  const [formData, setFormData] = React.useState({
    nisn: "",
    name: "",
    email: "",
    class: "",
    field: "Skill Development"
  });

  const fetchParticipants = async () => {
    try {
      const data = await participantsApi.getAll();
      setParticipants(data);
    } catch (err) {
      toast.error("Gagal mengambil data peserta");
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
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <Input 
            placeholder="Cari nama atau NISN..." 
            className="pl-10 bg-white border-slate-200"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        
        <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus size={18} className="mr-2" />
              Tambah Peserta
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Tambah Peserta Baru</DialogTitle>
              <DialogDescription>
                Lengkapi data peserta di bawah ini. QR Code akan digenerate otomatis.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddParticipant} className="space-y-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="nisn" className="text-right">NISN</Label>
                <Input 
                  id="nisn" 
                  className="col-span-3" 
                  value={formData.nisn}
                  onChange={(e) => setFormData({...formData, nisn: e.target.value})}
                  required 
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">Nama</Label>
                <Input 
                  id="name" 
                  className="col-span-3" 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required 
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="email" className="text-right">Email</Label>
                <Input 
                  id="email" 
                  type="email" 
                  className="col-span-3" 
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  required 
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="class" className="text-right">Kelas</Label>
                <Input 
                  id="class" 
                  className="col-span-3" 
                  value={formData.class}
                  onChange={(e) => setFormData({...formData, class: e.target.value})}
                  required 
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="field" className="text-right">Bidang</Label>
                <Select 
                  value={formData.field} 
                  onValueChange={(v) => setFormData({...formData, field: v})}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Pilih Bidang" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Skill Development">Skill Development</SelectItem>
                    <SelectItem value="Design">Design</SelectItem>
                    <SelectItem value="Data Analyst">Data Analyst</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <DialogFooter>
                <Button type="submit" className="bg-blue-600">Simpan Peserta</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead className="w-[100px]">NISN</TableHead>
              <TableHead>Nama</TableHead>
              <TableHead>Kelas</TableHead>
              <TableHead>Bidang</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredParticipants.length > 0 ? (
              filteredParticipants.map((p) => (
                <TableRow key={p.id} className="hover:bg-slate-50/50 transition-colors">
                  <TableCell className="font-medium text-slate-600">{p.nisn}</TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-semibold text-slate-900">{p.name}</span>
                      <span className="text-xs text-slate-500">{p.email}</span>
                    </div>
                  </TableCell>
                  <TableCell>{p.class}</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-none font-medium">
                      {p.field}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {p.confirmed ? (
                      <Badge className="bg-emerald-100 text-emerald-700 border-none flex w-fit items-center">
                        <CheckCircle2 size={14} className="mr-1" /> Terkonfirmasi
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-slate-400 border-slate-200">Menunggu</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      {!p.confirmed && (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="h-8 text-emerald-600 border-emerald-200 hover:bg-emerald-50"
                          onClick={() => handleConfirm(p.id)}
                        >
                          Konfirmasi
                        </Button>
                      )}
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-slate-400 hover:text-blue-600"
                        onClick={() => {
                          setSelectedParticipant(p);
                          setIsQrModalOpen(true);
                        }}
                      >
                        <QrIcon size={18} />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400">
                        <MoreVertical size={18} />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center text-slate-400 italic">
                  Tidak ada data peserta ditemukan
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* QR Modal */}
      <Dialog open={isQrModalOpen} onOpenChange={setIsQrModalOpen}>
        <DialogContent className="sm:max-w-[350px]">
          <DialogHeader>
            <DialogTitle className="text-center">QR Code Peserta</DialogTitle>
            <DialogDescription className="text-center">
              Gunakan kode ini untuk absensi digital
            </DialogDescription>
          </DialogHeader>
          {selectedParticipant && (
            <div className="flex flex-col items-center space-y-6 py-6">
              <div className="p-4 bg-white rounded-2xl shadow-inner border border-slate-100">
                <QRCodeSVG 
                  id={`qr-${selectedParticipant.nisn}`}
                  value={selectedParticipant.qrCode} 
                  size={200}
                  level="H"
                  includeMargin={true}
                />
              </div>
              <div className="text-center">
                <h4 className="font-bold text-lg text-slate-900">{selectedParticipant.name}</h4>
                <p className="text-sm text-slate-500">{selectedParticipant.nisn} • {selectedParticipant.class}</p>
              </div>
              <Button 
                className="w-full bg-blue-600" 
                onClick={() => downloadQR(selectedParticipant.nisn, selectedParticipant.name)}
              >
                <Download size={18} className="mr-2" />
                Download QR Code
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
