import { useState, useMemo } from "react";
import { Search, Filter, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { mockInstruments, getSetores, type InstrumentStatus } from "@/lib/mock-data";

const statusLabels: Record<InstrumentStatus, string> = {
  ativo: "Ativo",
  inativo: "Inativo",
  manutencao: "Manutenção",
};

const statusVariant: Record<InstrumentStatus, "default" | "secondary" | "destructive" | "outline"> = {
  ativo: "default",
  inativo: "secondary",
  manutencao: "outline",
};

function getCalibrationBadge(proximaCalibracao?: string) {
  if (!proximaCalibracao) return null;
  const today = new Date();
  const prox = new Date(proximaCalibracao);
  const in30 = new Date(today);
  in30.setDate(in30.getDate() + 30);

  if (prox < today) {
    return <Badge variant="destructive" className="text-[10px]">Vencido</Badge>;
  }
  if (prox <= in30) {
    return <Badge variant="outline" className="text-[10px] border-warning/30 text-warning">A vencer</Badge>;
  }
  return <Badge variant="outline" className="text-[10px] border-success/30 text-success">Em dia</Badge>;
}

export default function Instruments() {
  const [search, setSearch] = useState("");
  const [setorFilter, setSetorFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const setores = getSetores(mockInstruments);

  const filtered = useMemo(() => {
    return mockInstruments.filter((i) => {
      const matchSearch =
        i.codigo.toLowerCase().includes(search.toLowerCase()) ||
        i.descricao.toLowerCase().includes(search.toLowerCase()) ||
        i.fabricante.toLowerCase().includes(search.toLowerCase()) ||
        i.responsavel.toLowerCase().includes(search.toLowerCase());
      const matchSetor = setorFilter === "all" || i.setor === setorFilter;
      const matchStatus = statusFilter === "all" || i.status === statusFilter;
      return matchSearch && matchSetor && matchStatus;
    });
  }, [search, setorFilter, statusFilter]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Instrumentos</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {filtered.length} instrumento(s) encontrado(s)
          </p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Novo Instrumento
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por código, descrição, fabricante..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={setorFilter} onValueChange={setSetorFilter}>
          <SelectTrigger className="w-[180px]">
            <Filter className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
            <SelectValue placeholder="Setor" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os Setores</SelectItem>
            {setores.map((s) => (
              <SelectItem key={s} value={s}>{s}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos Status</SelectItem>
            <SelectItem value="ativo">Ativo</SelectItem>
            <SelectItem value="inativo">Inativo</SelectItem>
            <SelectItem value="manutencao">Manutenção</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="rounded-lg border border-border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="font-semibold text-xs">Código</TableHead>
                <TableHead className="font-semibold text-xs">Descrição</TableHead>
                <TableHead className="font-semibold text-xs">Fabricante</TableHead>
                <TableHead className="font-semibold text-xs">Setor</TableHead>
                <TableHead className="font-semibold text-xs">Responsável</TableHead>
                <TableHead className="font-semibold text-xs">Status</TableHead>
                <TableHead className="font-semibold text-xs">Calibração</TableHead>
                <TableHead className="font-semibold text-xs">Próx. Calibração</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((inst) => (
                <TableRow key={inst.id} className="cursor-pointer hover:bg-muted/30 transition-colors">
                  <TableCell className="font-mono text-sm font-medium">{inst.codigo}</TableCell>
                  <TableCell className="text-sm max-w-[200px] truncate">{inst.descricao}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{inst.fabricante}</TableCell>
                  <TableCell className="text-sm">{inst.setor}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{inst.responsavel}</TableCell>
                  <TableCell>
                    <Badge variant={statusVariant[inst.status]} className="text-[10px]">
                      {statusLabels[inst.status]}
                    </Badge>
                  </TableCell>
                  <TableCell>{getCalibrationBadge(inst.proximaCalibracao)}</TableCell>
                  <TableCell className="text-sm text-muted-foreground font-mono">
                    {inst.proximaCalibracao || "—"}
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
                    Nenhum instrumento encontrado.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
