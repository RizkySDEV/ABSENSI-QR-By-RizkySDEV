import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { dashboardApi } from "@/lib/api";
import { 
  Users, 
  UserCheck, 
  TrendingUp, 
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  MoreHorizontal
} from "lucide-react";
import { 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from "recharts";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const data = [
  { name: "Sen", hadir: 45 },
  { name: "Sel", hadir: 52 },
  { name: "Rab", hadir: 48 },
  { name: "Kam", hadir: 61 },
  { name: "Jum", hadir: 55 },
  { name: "Sab", hadir: 30 },
  { name: "Min", hadir: 10 },
];

export default function Dashboard() {
  const [stats, setStats] = React.useState<any>(null);

  React.useEffect(() => {
    dashboardApi.getStats().then(setStats).catch(console.error);
  }, []);

  if (!stats) return (
    <div className="flex items-center justify-center h-[60vh]">
      <div className="flex flex-col items-center space-y-4">
        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
        <p className="text-slate-500 font-medium animate-pulse">Menyiapkan dashboard...</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-10">
      {/* Welcome Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 font-display tracking-tight">Halo, Admin! 👋</h2>
          <p className="text-slate-500 mt-1">Berikut adalah ringkasan absensi hari ini.</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" className="rounded-xl border-slate-200 bg-white shadow-sm">
            <Calendar size={18} className="mr-2 text-slate-400" />
            {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Peserta" 
          value={stats.totalParticipants} 
          icon={Users} 
          trend="+12%" 
          trendUp={true}
          color="blue"
        />
        <StatCard 
          title="Hadir Hari Ini" 
          value={stats.presentToday} 
          icon={UserCheck} 
          trend="+5%" 
          trendUp={true}
          color="green"
        />
        <StatCard 
          title="Rata-rata Kehadiran" 
          value={`${Math.round(stats.attendanceRate)}%`} 
          icon={TrendingUp} 
          trend="-2%" 
          trendUp={false}
          color="purple"
        />
        <StatCard 
          title="Waktu Rata-rata" 
          value="07:45" 
          icon={Clock} 
          trend="Tepat Waktu" 
          trendUp={true}
          color="orange"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Chart */}
        <Card className="lg:col-span-2 border-none shadow-sm bg-white rounded-3xl overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-xl font-bold font-display">Grafik Kehadiran</CardTitle>
              <p className="text-sm text-slate-400">Statistik kehadiran 7 hari terakhir</p>
            </div>
            <Button variant="ghost" size="icon" className="rounded-xl text-slate-400">
              <MoreHorizontal size={20} />
            </Button>
          </CardHeader>
          <CardContent className="h-[380px] pt-6">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorHadir" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1a73e8" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#1a73e8" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: "#94a3b8", fontSize: 12, fontWeight: 500 }}
                  dy={15}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: "#94a3b8", fontSize: 12, fontWeight: 500 }}
                  dx={-10}
                />
                <Tooltip 
                  contentStyle={{ 
                    borderRadius: "16px", 
                    border: "none", 
                    boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)",
                    padding: "12px 16px"
                  }}
                  cursor={{ stroke: '#1a73e8', strokeWidth: 2, strokeDasharray: '5 5' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="hadir" 
                  stroke="#1a73e8" 
                  strokeWidth={4}
                  fillOpacity={1} 
                  fill="url(#colorHadir)" 
                  animationDuration={2000}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="border-none shadow-sm bg-white rounded-3xl overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-xl font-bold font-display">Aktivitas</CardTitle>
              <p className="text-sm text-slate-400">Absensi terbaru hari ini</p>
            </div>
            <Button variant="ghost" size="icon" className="rounded-xl text-slate-400">
              <MoreHorizontal size={20} />
            </Button>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="space-y-5">
              {stats.recentAttendance.length > 0 ? (
                stats.recentAttendance.map((item: any, idx: number) => (
                  <motion.div 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    key={item.id} 
                    className="flex items-center space-x-4 p-3 rounded-2xl hover:bg-slate-50 transition-colors group"
                  >
                    <div className="h-12 w-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-600 font-bold shrink-0 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                      {item.name[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-slate-900 truncate">{item.name}</p>
                      <p className="text-xs text-slate-400 font-medium">{item.field}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-bold text-primary">{item.time}</p>
                      <div className="flex items-center justify-end space-x-1 mt-0.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-success"></div>
                        <p className="text-[10px] font-bold text-success uppercase tracking-tighter">Hadir</p>
                      </div>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center space-y-3">
                  <div className="p-4 bg-slate-50 rounded-full">
                    <Clock className="text-slate-300" size={32} />
                  </div>
                  <p className="text-slate-400 text-sm font-medium italic">Belum ada aktivitas hari ini</p>
                </div>
              )}
            </div>
            {stats.recentAttendance.length > 0 && (
              <Button variant="ghost" className="w-full mt-6 text-primary font-bold text-sm rounded-xl hover:bg-primary/5">
                Lihat Semua Riwayat
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, trend, trendUp, color }: any) {
  const colors: any = {
    blue: "bg-blue-50 text-primary",
    green: "bg-emerald-50 text-success",
    purple: "bg-purple-50 text-purple-600",
    orange: "bg-orange-50 text-warning",
  };

  return (
    <motion.div
      whileHover={{ y: -6 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
    >
      <Card className="border-none shadow-sm bg-white rounded-3xl overflow-hidden group">
        <CardContent className="p-7">
          <div className="flex items-center justify-between mb-5">
            <div className={cn("p-3 rounded-2xl transition-transform group-hover:scale-110 duration-300", colors[color])}>
              <Icon size={26} />
            </div>
            <div className={cn(
              "flex items-center text-[0.7rem] font-bold px-2.5 py-1 rounded-full",
              trendUp ? "bg-success/10 text-success" : "bg-danger/10 text-danger"
            )}>
              {trendUp ? <ArrowUpRight size={14} className="mr-1" /> : <ArrowDownRight size={14} className="mr-1" />}
              {trend}
            </div>
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">{title}</p>
            <h3 className="text-3xl font-bold text-slate-900 font-display tracking-tight">{value}</h3>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
