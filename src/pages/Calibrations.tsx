import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ClipboardCheck, Plus } from "lucide-react";
import { CalibrationDialog, type CalibrationFormValues } from "@/components/CalibrationDialog";
import { useCalibrations, useCreateCalibration } from "@/hooks/useCalibrations";
import { useInstruments } from "@/hooks/useInstruments";

export default function Calibrations() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const { data: calibrations = [], isLoading } = useCalibrations();
  const { data: instruments = [] } = useInstruments();
  const createMutation = useCreateCalibration();

  const handleSubmit = (values: CalibrationFormValues) => {
    const instrument = instruments.find((i) => i.id === values.instrumento_id);
    const periodicidade = instrument?.periodicidade_dias || 180;
    const dataCal = new Date(values.data_calibracao);
    dataCal.setDate(dataCal.getDate() + periodicidade);
    const proxima = dataCal.toISOString().split("T")[0];

    createMutation.mutate(
      {
        instrumento_id: values.instrumento_id,
        data_calibracao: values.data_calibracao,
        resultado: values.resultado,
        erro_medido: values.erro_medido,
        tolerancia: values.tolerancia,
        tecnico_nome: values.tecnico_nome,
        observacoes: values.observacoes || null,
        proxima_calibracao: proxima,
      },
      { onSuccess: () => setDialogOpen(false) }
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Calibrações</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Histórico de calibrações realizadas
          </p>
        </div>
        <Button className="gap-2" onClick={() => setDialogOpen(true)}>
          <Plus className="h-4 w-4" />
          Registrar Calibração
        </Button>
      </div>

      <div className="rounded-lg border border-border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="font-semibold text-xs">Instrumento</TableHead>
                <TableHead className="font-semibold text-xs">Data</TableHead>
                <TableHead className="font-semibold text-xs">Técnico</TableHead>
                <TableHead className="font-semibold text-xs">Resultado</TableHead>
                <TableHead className="font-semibold text-xs">Erro Medido</TableHead>
                <TableHead className="font-semibold text-xs">Tolerância</TableHead>
                <TableHead className="font-semibold text-xs">Próx. Calibração</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {calibrations.map((cal: any) => (
                <TableRow key={cal.id}>
                  <TableCell>
                    <div>
                      <p className="text-sm font-medium font-mono">{cal.instruments?.codigo || "—"}</p>
                      <p className="text-xs text-muted-foreground truncate max-w-[180px]">
                        {cal.instruments?.descricao || ""}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm font-mono">{cal.data_calibracao}</TableCell>
                  <TableCell className="text-sm">{cal.tecnico_nome}</TableCell>
                  <TableCell>
                    <Badge
                      variant={cal.resultado === "aprovado" ? "default" : "destructive"}
                      className="text-[10px]"
                    >
                      {cal.resultado === "aprovado" ? "Aprovado" : "Reprovado"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm font-mono">{cal.erro_medido}</TableCell>
                  <TableCell className="text-sm font-mono">{cal.tolerancia}</TableCell>
                  <TableCell className="text-sm font-mono">{cal.proxima_calibracao}</TableCell>
                </TableRow>
              ))}
              {calibrations.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                    <div className="flex flex-col items-center gap-2">
                      <ClipboardCheck className="h-8 w-8 opacity-30" />
                      Nenhuma calibração registrada.
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <CalibrationDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        instruments={instruments}
        onSubmit={handleSubmit}
        isLoading={createMutation.isPending}
      />
    </div>
  );
}
