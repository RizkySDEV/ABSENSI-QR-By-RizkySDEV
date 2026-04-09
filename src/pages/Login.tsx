import React from "react";
import { useNavigate } from "react-router-dom";
import { authApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";
import { QrCode, Mail, Lock, ArrowRight, ShieldCheck } from "lucide-react";
import { motion } from "motion/react";

export default function Login() {
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const data = await authApi.login({ email, password });
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      toast.success("Login berhasil! Selamat datang kembali.");
      navigate("/");
    } catch (err: any) {
      toast.error(err.message || "Login gagal. Periksa email dan password Anda.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] flex items-center justify-center p-6 relative overflow-hidden font-sans">
      {/* Decorative Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-success/5 rounded-full blur-[120px]" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-[480px] z-10"
      >
        <div className="flex flex-col items-center mb-10">
          <motion.div 
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            className="bg-primary p-4 rounded-[2rem] shadow-2xl shadow-primary/30 mb-6"
          >
            <QrCode className="text-white" size={48} />
          </motion.div>
          <h1 className="text-4xl font-bold text-slate-900 font-display tracking-tight">Absensi Pro</h1>
          <p className="text-slate-500 mt-2 font-medium">Sistem Absensi Digital Terintegrasi Google Sheets</p>
        </div>

        <Card className="border-none shadow-2xl bg-white rounded-[2.5rem] overflow-hidden">
          <CardHeader className="pt-10 px-10 pb-2">
            <div className="flex items-center space-x-2 text-primary mb-2">
              <ShieldCheck size={18} />
              <span className="text-xs font-bold uppercase tracking-widest">Admin Portal</span>
            </div>
            <CardTitle className="text-2xl font-bold font-display">Selamat Datang</CardTitle>
            <CardDescription className="text-slate-400 font-medium">
              Silakan masuk untuk mengelola data absensi.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-10">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-bold text-slate-700 ml-1">Email Address</Label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={18} />
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="Masukkan email Anda" 
                    className="google-input pl-12 h-14 text-base"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between ml-1">
                  <Label htmlFor="password" className="text-sm font-bold text-slate-700">Password</Label>
                  <button type="button" className="text-xs font-bold text-primary hover:underline">Lupa Password?</button>
                </div>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={18} />
                  <Input 
                    id="password" 
                    type="password" 
                    placeholder="••••••••" 
                    className="google-input pl-12 h-14 text-base"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>
              <Button 
                type="submit" 
                className="w-full bg-primary hover:bg-primary-hover text-white h-14 rounded-2xl text-lg font-bold shadow-lg shadow-primary/20 group transition-all duration-300"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Memproses...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    <span>Masuk Sekarang</span>
                    <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" size={20} />
                  </div>
                )}
              </Button>
            </form>

            <div className="mt-10 pt-8 border-t border-slate-100 text-center">
              <p className="text-slate-400 text-sm font-medium">
                Butuh bantuan? <a href="https://wa.me/6282148380548" target="_blank" rel="noreferrer" className="text-primary font-bold hover:underline">Hubungi Support</a>
              </p>
            </div>
          </CardContent>
        </Card>

        <p className="text-center mt-8 text-slate-400 text-xs font-medium uppercase tracking-widest">
          &copy; 2026 Absensi Pro • Powered by <a href="https://portofolio-rizky-s.vercel.app/" target="_blank" rel="noreferrer" className="text-primary hover:underline">RizkySDEV</a>
        </p>
      </motion.div>
    </div>
  );
}
