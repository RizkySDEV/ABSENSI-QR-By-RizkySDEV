import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { dashboardApi } from "@/lib/api";
import { 
  Users, 
  UserCheck, 
  TrendingUp, 
  Clock,
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from "recharts";
import { motion } from "motion/react";

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

  if (!stats) return <div className="p-8">Memuat data...</div>;

  return (
    <div className="space-y-8">
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
        <Card className="lg:col-span-2 border-none shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Grafik Kehadiran Mingguan</CardTitle>
          </CardHeader>
          <CardContent className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorHadir" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: "#64748b", fontSize: 12 }}
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: "#64748b", fontSize: 12 }}
                />
                <Tooltip 
                  contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)" }}
                />
                <Area 
                  type="monotone" 
                  dataKey="hadir" 
                  stroke="#2563eb" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorHadir)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="border-none shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Aktivitas Terbaru</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {stats.recentAttendance.length > 0 ? (
                stats.recentAttendance.map((item: any) => (
                  <div key={item.id} className="flex items-center space-x-4">
                    <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold shrink-0">
                      {item.name[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900 truncate">{item.name}</p>
                      <p className="text-xs text-slate-500">{item.field}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-semibold text-blue-600">{item.time}</p>
                      <p className="text-[10px] text-slate-400">Hadir</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-slate-400 text-sm italic">
                  Belum ada aktivitas hari ini
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, trend, trendUp, color }: any) {
  const colors: any = {
    blue: "bg-blue-50 text-blue-600",
    green: "bg-emerald-50 text-emerald-600",
    purple: "bg-purple-50 text-purple-600",
    orange: "bg-orange-50 text-orange-600",
  };

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ type: "spring", stiffness: 300 }}
    >
      <Card className="border-none shadow-sm overflow-hidden relative">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className={cn("p-2.5 rounded-xl", colors[color])}>
              <Icon size={24} />
            </div>
            <div className={cn(
              "flex items-center text-xs font-medium px-2 py-1 rounded-full",
              trendUp ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"
            )}>
              {trendUp ? <ArrowUpRight size={14} className="mr-1" /> : <ArrowDownRight size={14} className="mr-1" />}
              {trend}
            </div>
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
            <h3 className="text-2xl font-bold text-slate-900">{value}</h3>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(" ");
}
