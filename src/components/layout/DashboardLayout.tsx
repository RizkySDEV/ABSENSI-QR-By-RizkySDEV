import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { 
  LayoutDashboard, 
  Users, 
  QrCode, 
  Settings, 
  LogOut, 
  Menu,
  X,
  Bell,
  FileSpreadsheet,
  CloudCheck
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "motion/react";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const navItems = [
  { name: "Dashboard", icon: LayoutDashboard, path: "/" },
  { name: "Data Peserta", icon: Users, path: "/participants" },
  { name: "Absensi", icon: QrCode, path: "/scanner" },
  { name: "Pengaturan", icon: Settings, path: "/settings" },
];

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(true);
  const [isSheetsConnected, setIsSheetsConnected] = React.useState(true); // Mock status
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] flex font-sans">
      {/* Sidebar */}
      <aside 
        className={cn(
          "bg-white border-r border-slate-200 transition-all duration-300 flex flex-col z-50",
          isSidebarOpen ? "w-72" : "w-20"
        )}
      >
        <div className="p-6 flex items-center justify-between">
          <AnimatePresence mode="wait">
            {isSidebarOpen ? (
              <motion.div 
                key="logo-full"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="flex items-center space-x-3"
              >
                <div className="bg-primary p-2 rounded-xl shadow-lg shadow-primary/20">
                  <QrCode className="text-white" size={24} />
                </div>
                <span className="text-xl font-bold text-slate-900 tracking-tight font-display">Absensi Pro</span>
              </motion.div>
            ) : (
              <motion.div 
                key="logo-icon"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="bg-primary p-2 rounded-xl mx-auto"
              >
                <QrCode className="text-white" size={24} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <nav className="flex-1 px-4 space-y-1.5 mt-6">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center p-3.5 rounded-2xl transition-all duration-200 group relative",
                  isActive 
                    ? "bg-primary/10 text-primary" 
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                )}
              >
                <Icon size={22} className={cn("min-w-[22px]", isActive ? "text-primary" : "text-slate-400 group-hover:text-slate-600")} />
                {isSidebarOpen && (
                  <span className="ml-4 font-medium text-[0.95rem]">{item.name}</span>
                )}
                {isActive && (
                  <motion.div 
                    layoutId="active-pill"
                    className="absolute left-0 w-1 h-6 bg-primary rounded-r-full"
                  />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-100">
          <Button 
            variant="ghost" 
            className="w-full justify-start text-slate-600 hover:text-danger hover:bg-danger/5 rounded-2xl p-3.5"
            onClick={handleLogout}
          >
            <LogOut size={20} />
            {isSidebarOpen && <span className="ml-4 font-medium">Keluar</span>}
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-8 shrink-0">
          <div className="flex items-center space-x-4">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="text-slate-500 hover:bg-slate-100 rounded-xl"
            >
              <Menu size={22} />
            </Button>
            <h1 className="text-xl font-bold text-slate-800 font-display">
              {navItems.find(item => item.path === location.pathname)?.name || "Dashboard"}
            </h1>
          </div>

          <div className="flex items-center space-x-6">
            {/* Google Sheets Status */}
            <div className="hidden md:flex items-center space-x-2 px-4 py-2 bg-success/5 border border-success/10 rounded-2xl">
              <FileSpreadsheet className="text-success" size={18} />
              <div className="flex flex-col">
                <span className="text-[10px] uppercase tracking-wider font-bold text-success/70 leading-none">Google Sheets</span>
                <div className="flex items-center space-x-1">
                  <CloudCheck className="text-success" size={12} />
                  <span className="text-xs font-semibold text-success">Connected</span>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <Button variant="ghost" size="icon" className="text-slate-500 relative hover:bg-slate-100 rounded-xl">
                <Bell size={20} />
                <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-danger rounded-full border-2 border-white"></span>
              </Button>
              <div className="h-10 w-10 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold text-lg shadow-sm">
                A
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-8 lg:p-10">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
