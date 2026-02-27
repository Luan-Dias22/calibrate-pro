import { mockCalibrations, mockInstruments } from "@/lib/mock-data";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ClipboardCheck } from "lucide-react";

export default function Calibrations() {
  const getInstrument = (id: string) => mockInstruments.find((i) => i.id === id);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Calibrações</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Histórico de calibrações realizadas
        </p>
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
              {mockCalibrations.map((cal) => {
                const inst = getInstrument(cal.instrumentoId);
                return (
                  <TableRow key={cal.id}>
                    <TableCell>
                      <div>
                        <p className="text-sm font-medium font-mono">{inst?.codigo}</p>
                        <p className="text-xs text-muted-foreground truncate max-w-[180px]">
                          {inst?.descricao}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm font-mono">{cal.dataCalibracao}</TableCell>
                    <TableCell className="text-sm">{cal.tecnicoNome}</TableCell>
                    <TableCell>
                      <Badge
                        variant={cal.resultado === "aprovado" ? "default" : "destructive"}
                        className="text-[10px]"
                      >
                        {cal.resultado === "aprovado" ? "Aprovado" : "Reprovado"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm font-mono">{cal.erroMedido}</TableCell>
                    <TableCell className="text-sm font-mono">{cal.tolerancia}</TableCell>
                    <TableCell className="text-sm font-mono">{cal.proximaCalibracao}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </div>

      {mockCalibrations.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
          <ClipboardCheck className="h-12 w-12 mb-4 opacity-30" />
          <p>Nenhuma calibração registrada.</p>
        </div>
      )}
    </div>
  );
}
