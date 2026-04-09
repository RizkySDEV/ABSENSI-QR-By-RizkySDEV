import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { authApi } from "@/lib/api";
import { 
  Database, 
  ExternalLink, 
  Save, 
  Shield, 
  Smartphone,
  CheckCircle2,
  UserPlus,
  ShieldAlert
} from "lucide-react";

export default function Settings() {
  const [user, setUser] = React.useState<any>(null);
  const [admins, setAdmins] = React.useState<any[]>([]);
  const [newAdmin, setNewAdmin] = React.useState({ email: "", password: "", name: "", role: "admin" });
  const [config, setConfig] = React.useState({
    spreadsheetId: "1-abc-def-ghi-jkl",
    apiKey: "AIzaSy...",
    adminEmail: "admin@absensi.com"
  });

  React.useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      const parsed = JSON.parse(userData);
      setUser(parsed);
      if (parsed.role === "developer") {
        fetchAdmins();
      }
    }
  }, []);

  const fetchAdmins = async () => {
    try {
      const data = await authApi.getAdmins();
      setAdmins(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await authApi.createAdmin(newAdmin);
      toast.success("Admin baru berhasil ditambahkan");
      setNewAdmin({ email: "", password: "", name: "", role: "admin" });
      fetchAdmins();
    } catch (err: any) {
      toast.error(err.message || "Gagal menambahkan admin");
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Pengaturan berhasil disimpan");
  };

  return (
    <div className="max-w-4xl space-y-8">
      {/* Developer Only: Admin Management */}
      {user?.role === "developer" && (
        <Card className="border-none shadow-sm bg-primary/5 border border-primary/10">
          <CardHeader>
            <div className="flex items-center space-x-3 mb-2">
              <div className="p-2 bg-primary text-white rounded-lg">
                <ShieldAlert size={24} />
              </div>
              <div>
                <CardTitle>Manajemen Admin (Developer Only)</CardTitle>
                <CardDescription>Daftarkan akun admin baru untuk menggunakan sistem ini</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <form onSubmit={handleCreateAdmin} className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white p-6 rounded-2xl border border-slate-100">
              <div className="space-y-2">
                <Label>Nama Lengkap</Label>
                <Input 
                  value={newAdmin.name}
                  onChange={(e) => setNewAdmin({...newAdmin, name: e.target.value})}
                  placeholder="Nama Admin"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input 
                  type="email"
                  value={newAdmin.email}
                  onChange={(e) => setNewAdmin({...newAdmin, email: e.target.value})}
                  placeholder="email@admin.com"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Password</Label>
                <Input 
                  type="password"
                  value={newAdmin.password}
                  onChange={(e) => setNewAdmin({...newAdmin, password: e.target.value})}
                  placeholder="••••••••"
                  required
                />
              </div>
              <div className="flex items-end">
                <Button type="submit" className="w-full bg-primary">
                  <UserPlus size={18} className="mr-2" />
                  Tambah Admin
                </Button>
              </div>
            </form>

            <div className="space-y-3">
              <h4 className="text-sm font-bold text-slate-700 ml-1">Daftar Pengelola Terdaftar</h4>
              <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 border-b border-slate-100">
                    <tr>
                      <th className="text-left p-4 font-bold text-slate-600">Nama</th>
                      <th className="text-left p-4 font-bold text-slate-600">Email</th>
                      <th className="text-left p-4 font-bold text-slate-600">Role</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {admins.map((admin) => (
                      <tr key={admin.id}>
                        <td className="p-4 font-medium text-slate-800">{admin.name}</td>
                        <td className="p-4 text-slate-500">{admin.email}</td>
                        <td className="p-4">
                          <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
                            admin.role === 'developer' ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'
                          }`}>
                            {admin.role}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Google Sheets Config */}
      <Card className="border-none shadow-sm">
        <CardHeader>
          <div className="flex items-center space-x-3 mb-2">
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
              <Database size={24} />
            </div>
            <div>
              <CardTitle>Integrasi Google Sheets</CardTitle>
              <CardDescription>Hubungkan sistem absensi dengan spreadsheet Anda</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSave} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="spreadsheetId">Spreadsheet ID</Label>
                <Input 
                  id="spreadsheetId" 
                  value={config.spreadsheetId}
                  onChange={(e) => setConfig({...config, spreadsheetId: e.target.value})}
                  placeholder="ID Spreadsheet Anda" 
                />
                <p className="text-[10px] text-slate-400">Dapatkan dari URL Google Sheets Anda</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="apiKey">API Key / Service Account</Label>
                <Input 
                  id="apiKey" 
                  type="password"
                  value={config.apiKey}
                  onChange={(e) => setConfig({...config, apiKey: e.target.value})}
                  placeholder="Google Cloud API Key" 
                />
                <p className="text-[10px] text-slate-400">Gunakan API Key dengan akses Google Sheets</p>
              </div>
            </div>
            
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="h-2 w-2 bg-emerald-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-slate-600">Status Koneksi: Terhubung</span>
              </div>
              <Button variant="outline" size="sm" className="text-xs">
                Tes Koneksi
              </Button>
            </div>

            <div className="flex justify-end">
              <Button type="submit" className="bg-blue-600">
                <Save size={18} className="mr-2" />
                Simpan Konfigurasi
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Admin Account */}
      <Card className="border-none shadow-sm">
        <CardHeader>
          <div className="flex items-center space-x-3 mb-2">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <Shield size={24} />
            </div>
            <div>
              <CardTitle>Akun Admin</CardTitle>
              <CardDescription>Kelola kredensial akses dashboard</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="adminEmail">Email Admin</Label>
            <Input 
              id="adminEmail" 
              value={config.adminEmail}
              onChange={(e) => setConfig({...config, adminEmail: e.target.value})}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="newPass">Password Baru</Label>
              <Input id="newPass" type="password" placeholder="••••••••" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPass">Konfirmasi Password</Label>
              <Input id="confirmPass" type="password" placeholder="••••••••" />
            </div>
          </div>
          <div className="flex justify-end">
            <Button variant="outline">Update Password</Button>
          </div>
        </CardContent>
      </Card>

      {/* System Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 bg-white rounded-xl shadow-sm border border-slate-100 flex flex-col items-center text-center">
          <Smartphone className="text-slate-400 mb-3" size={32} />
          <h4 className="font-bold text-slate-800">Mobile Ready</h4>
          <p className="text-xs text-slate-500 mt-1">Scanner dioptimalkan untuk perangkat mobile</p>
        </div>
        <div className="p-6 bg-white rounded-xl shadow-sm border border-slate-100 flex flex-col items-center text-center">
          <CheckCircle2 className="text-emerald-500 mb-3" size={32} />
          <h4 className="font-bold text-slate-800">Auto Sync</h4>
          <p className="text-xs text-slate-500 mt-1">Data otomatis tersinkron ke Google Sheets</p>
        </div>
        <div className="p-6 bg-white rounded-xl shadow-sm border border-slate-100 flex flex-col items-center text-center">
          <ExternalLink className="text-blue-500 mb-3" size={32} />
          <h4 className="font-bold text-slate-800">API Access</h4>
          <p className="text-xs text-slate-500 mt-1">Integrasi API tersedia untuk pengembang</p>
        </div>
      </div>
    </div>
  );
}
