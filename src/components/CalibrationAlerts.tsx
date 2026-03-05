import { AlertTriangle, Clock, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useInstruments, type Instrument } from "@/hooks/useInstruments";
import { Skeleton } from "@/components/ui/skeleton";

function normalizeDate(dateStr: string) {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function todayLocal() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

function getAlertInstruments(instruments: Instrument[]) {
  const today = todayLocal();
  const in30Days = new Date(today);
  in30Days.setDate(in30Days.getDate() + 30);

  const vencidos = instruments.filter(i => {
    if (!i.proxima_calibracao) return false;
    return normalizeDate(i.proxima_calibracao) < today;
  });

  const aVencer = instruments.filter(i => {
    if (!i.proxima_calibracao) return false;
    const prox = normalizeDate(i.proxima_calibracao);
    return prox >= today && prox <= in30Days;
  });

  return { vencidos, aVencer };
}

export function CalibrationAlerts() {
  const { data: instruments = [], isLoading } = useInstruments();
  const { vencidos, aVencer } = getAlertInstruments(instruments);

  if (isLoading) return <Skeleton className="h-48" />;

  return (
    <div className="rounded-lg border border-border bg-card p-5">
      <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
        <AlertTriangle className="h-4 w-4 text-warning" />
        Alertas de Calibração
      </h3>

      <div className="space-y-3">
        {vencidos.length === 0 && aVencer.length === 0 && (
          <div className="flex items-center gap-2 text-sm text-success py-2">
            <CheckCircle2 className="h-4 w-4" />
            Todos os instrumentos estão em dia!
          </div>
        )}

        {vencidos.map((inst) => (
          <div key={inst.id} className="flex items-center justify-between p-3 rounded-md bg-destructive/5 border border-destructive/10">
            <div className="flex items-center gap-3 min-w-0">
              <AlertTriangle className="h-4 w-4 text-destructive shrink-0" />
              <div className="min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{inst.codigo} - {inst.descricao}</p>
                <p className="text-xs text-muted-foreground">{inst.setor}</p>
              </div>
            </div>
            <Badge variant="destructive" className="shrink-0 text-[10px]">Vencido</Badge>
          </div>
        ))}

        {aVencer.map((inst) => (
          <div key={inst.id} className="flex items-center justify-between p-3 rounded-md bg-warning/5 border border-warning/10">
            <div className="flex items-center gap-3 min-w-0">
              <Clock className="h-4 w-4 text-warning shrink-0" />
              <div className="min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{inst.codigo} - {inst.descricao}</p>
                <p className="text-xs text-muted-foreground">Vence em {inst.proxima_calibracao}</p>
              </div>
            </div>
            <Badge variant="outline" className="shrink-0 text-[10px] border-warning/30 text-warning">A vencer</Badge>
          </div>
        ))}
      </div>
    </div>
  );
}
