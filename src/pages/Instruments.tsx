import { useState, useMemo } from "react";
import { Search, Filter, Plus, Pencil, Trash2 } from "lucide-react";
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { InstrumentDialog } from "@/components/InstrumentDialog";
import {
  useInstruments,
  useCreateInstrument,
  useUpdateInstrument,
  useDeleteInstrument,
  type Instrument,
} from "@/hooks/useInstruments";
import { Skeleton } from "@/components/ui/skeleton";

type InstrumentStatus = "ativo" | "inativo" | "manutencao";

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

function getCalibrationBadge(proximaCalibracao?: string | null) {
  if (!proximaCalibracao) return null;
  const today = new Date();
  const prox = new Date(proximaCalibracao);
  const in30 = new Date(today);
  in30.setDate(in30.getDate() + 30);

  if (prox < today) return <Badge variant="destructive" className="text-[10px]">Vencido</Badge>;
  if (prox <= in30) return <Badge variant="outline" className="text-[10px] border-warning/30 text-warning">A vencer</Badge>;
  return <Badge variant="outline" className="text-[10px] border-success/30 text-success">Em dia</Badge>;
}

export default function Instruments() {
  const [search, setSearch] = useState("");
  const [setorFilter, setSetorFilter] = useState("all");
  const [calibracaoFilter, setCalibracaoFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingInstrument, setEditingInstrument] = useState<Instrument | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data: instruments = [], isLoading } = useInstruments();
  const createMutation = useCreateInstrument();
  const updateMutation = useUpdateInstrument();
  const deleteMutation = useDeleteInstrument();

  const setores = useMemo(() => [...new Set(instruments.map((i) => i.setor))], [instruments]);

  const filtered = useMemo(() => {
    return instruments.filter((i) => {
      const matchSearch =
        i.codigo.toLowerCase().includes(search.toLowerCase()) ||
        i.descricao.toLowerCase().includes(search.toLowerCase()) ||
        i.fabricante.toLowerCase().includes(search.toLowerCase()) ||
        i.responsavel.toLowerCase().includes(search.toLowerCase());
      const matchSetor = setorFilter === "all" || i.setor === setorFilter;
      const matchStatus = statusFilter === "all" || i.status === statusFilter;
      return matchSearch && matchSetor && matchStatus;
    });
  }, [instruments, search, setorFilter, statusFilter]);

  const handleSubmit = (values: any) => {
    if (editingInstrument) {
      updateMutation.mutate({ id: editingInstrument.id, ...values }, {
        onSuccess: () => { setDialogOpen(false); setEditingInstrument(null); },
      });
    } else {
      createMutation.mutate(values, {
        onSuccess: () => setDialogOpen(false),
      });
    }
  };

  const handleEdit = (inst: Instrument) => {
    setEditingInstrument(inst);
    setDialogOpen(true);
  };

  const handleDelete = () => {
    if (deleteId) {
      deleteMutation.mutate(deleteId, { onSuccess: () => setDeleteId(null) });
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Instrumentos</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {filtered.length} instrumento(s) encontrado(s)
          </p>
        </div>
        <Button className="gap-2" onClick={() => { setEditingInstrument(null); setDialogOpen(true); }}>
          <Plus className="h-4 w-4" />
          Novo Instrumento
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar por código, descrição, fabricante..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={setorFilter} onValueChange={setSetorFilter}>
          <SelectTrigger className="w-[180px]">
            <Filter className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
            <SelectValue placeholder="Setor" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os Setores</SelectItem>
            {setores.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
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
                <TableHead className="font-semibold text-xs w-[80px]">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((inst) => (
                <TableRow key={inst.id} className="hover:bg-muted/30 transition-colors">
                  <TableCell className="font-mono text-sm font-medium">{inst.codigo}</TableCell>
                  <TableCell className="text-sm max-w-[200px] truncate">{inst.descricao}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{inst.fabricante}</TableCell>
                  <TableCell className="text-sm">{inst.setor}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{inst.responsavel}</TableCell>
                  <TableCell>
                    <Badge variant={statusVariant[inst.status as InstrumentStatus]} className="text-[10px]">
                      {statusLabels[inst.status as InstrumentStatus] || inst.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{getCalibrationBadge(inst.proxima_calibracao)}</TableCell>
                  <TableCell className="text-sm text-muted-foreground font-mono">
                    {inst.proxima_calibracao || "—"}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleEdit(inst)}>
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => setDeleteId(inst.id)}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={9} className="h-24 text-center text-muted-foreground">
                    Nenhum instrumento encontrado.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <InstrumentDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        instrument={editingInstrument}
        onSubmit={handleSubmit}
        isLoading={createMutation.isPending || updateMutation.isPending}
      />

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este instrumento? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
