import {
  Wrench,
  AlertTriangle,
  CheckCircle2,
  Settings,
  TrendingUp,
  BarChart3,
  Clock,
} from "lucide-react";
import { StatCard } from "@/components/StatCard";
import { CalibrationAlerts } from "@/components/CalibrationAlerts";
import { useInstruments } from "@/hooks/useInstruments";
import { useCalibrations } from "@/hooks/useCalibrations";
import { Skeleton } from "@/components/ui/skeleton";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const COLORS = [
  "hsl(213, 56%, 33%)",
  "hsl(142, 71%, 35%)",
  "hsl(38, 92%, 50%)",
  "hsl(0, 72%, 51%)",
];

function normalizeDate(dateStr: string) {
  // Parse YYYY-MM-DD as local date to avoid timezone offset issues
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function todayLocal() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

function getStats(instruments: any[]) {
  const today = todayLocal();
  const in30Days = new Date(today);
  in30Days.setDate(in30Days.getDate() + 30);

  const total = instruments.length;
  const ativos = instruments.filter(i => i.status === 'ativo').length;
  const manutencao = instruments.filter(i => i.status === 'manutencao').length;

  const vencidos = instruments.filter(i => {
    if (!i.proxima_calibracao) return false;
    return normalizeDate(i.proxima_calibracao) < today;
  }).length;

  const aVencer30 = instruments.filter(i => {
    if (!i.proxima_calibracao) return false;
    const prox = normalizeDate(i.proxima_calibracao);
    return prox >= today && prox <= in30Days;
  }).length;

  const emDia = instruments.filter(i => {
    if (!i.proxima_calibracao) return false;
    return normalizeDate(i.proxima_calibracao) > in30Days;
  }).length;

  const taxaConformidade = total > 0 ? Math.round(((total - vencidos) / total) * 100) : 0;

  return { total, ativos, manutencao, vencidos, aVencer30, emDia, taxaConformidade };
}

export default function Dashboard() {
  const { data: instruments = [], isLoading: loadingInst } = useInstruments();
  const { data: calibrations = [], isLoading: loadingCal } = useCalibrations();

  if (loadingInst || loadingCal) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => <Skeleton key={i} className="h-28" />)}
        </div>
        <Skeleton className="h-64" />
      </div>
    );
  }

  const stats = getStats(instruments);

  const statusData = [
    { name: "Ativos", value: stats.ativos },
    { name: "Em dia", value: stats.emDia },
    { name: "A vencer", value: stats.aVencer30 },
    { name: "Vencidos", value: stats.vencidos },
  ];

  const setorData = instruments.reduce<Record<string, number>>((acc, i) => {
    acc[i.setor] = (acc[i.setor] || 0) + 1;
    return acc;
  }, {});

  const barData = Object.entries(setorData).map(([name, total]) => ({ name, total }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Visão geral do sistema de calibração
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total de Instrumentos" value={stats.total} icon={Wrench} animDelay={0} />
        <StatCard title="Em dia" value={stats.emDia} subtitle={`${stats.taxaConformidade}% conformidade`} icon={CheckCircle2} variant="success" animDelay={100} />
        <StatCard title="A vencer (30 dias)" value={stats.aVencer30} icon={Clock} variant="warning" animDelay={200} />
        <StatCard title="Vencidos" value={stats.vencidos} icon={AlertTriangle} variant="destructive" animDelay={300} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard title="Em Manutenção" value={stats.manutencao} icon={Settings} variant="info" />
        <StatCard title="Calibrações Realizadas" value={calibrations.length} icon={BarChart3} />
        <StatCard title="Taxa de Conformidade" value={`${stats.taxaConformidade}%`} icon={TrendingUp} variant="success" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 rounded-lg border border-border bg-card p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4">Instrumentos por Setor</h3>
          {barData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 20%, 88%)" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="hsl(215, 13%, 50%)" />
                <YAxis tick={{ fontSize: 11 }} stroke="hsl(215, 13%, 50%)" allowDecimals={false} />
                <Tooltip contentStyle={{ backgroundColor: "hsl(0, 0%, 100%)", border: "1px solid hsl(214, 20%, 88%)", borderRadius: "8px", fontSize: "12px" }} />
                <Bar dataKey="total" fill="hsl(213, 56%, 33%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-16">Sem dados</p>
          )}
        </div>

        <div className="lg:col-span-1 rounded-lg border border-border bg-card p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4">Status de Calibração</h3>
          {stats.total > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={statusData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={4} dataKey="value">
                    {statusData.map((_, idx) => <Cell key={idx} fill={COLORS[idx % COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: "hsl(0, 0%, 100%)", border: "1px solid hsl(214, 20%, 88%)", borderRadius: "8px", fontSize: "12px" }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap gap-3 mt-2 justify-center">
                {statusData.map((d, i) => (
                  <div key={d.name} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: COLORS[i] }} />
                    {d.name}: {d.value}
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-16">Sem dados</p>
          )}
        </div>

        <div className="lg:col-span-1">
          <CalibrationAlerts />
        </div>
      </div>
    </div>
  );
}
