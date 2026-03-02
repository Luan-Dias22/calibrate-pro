import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Instrument } from "@/hooks/useInstruments";

const schema = z.object({
  codigo: z.string().trim().min(1, "Obrigatório").max(50),
  serie: z.string().trim().min(1, "Obrigatório").max(100),
  descricao: z.string().trim().min(1, "Obrigatório").max(200),
  fabricante: z.string().trim().min(1, "Obrigatório").max(100),
  modelo: z.string().trim().min(1, "Obrigatório").max(100),
  setor: z.string().trim().min(1, "Obrigatório").max(100),
  responsavel: z.string().trim().min(1, "Obrigatório").max(100),
  data_aquisicao: z.string().min(1, "Obrigatório"),
  periodicidade_dias: z.coerce.number().int().min(1, "Mínimo 1 dia").max(3650),
  status: z.enum(["ativo", "inativo", "manutencao"]),
});

type FormValues = z.infer<typeof schema>;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  instrument?: Instrument | null;
  onSubmit: (values: FormValues) => void;
  isLoading?: boolean;
}

export function InstrumentDialog({ open, onOpenChange, instrument, onSubmit, isLoading }: Props) {
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      codigo: "",
      serie: "",
      descricao: "",
      fabricante: "",
      modelo: "",
      setor: "",
      responsavel: "",
      data_aquisicao: new Date().toISOString().split("T")[0],
      periodicidade_dias: 180,
      status: "ativo",
    },
  });

  useEffect(() => {
    if (instrument) {
      form.reset({
        codigo: instrument.codigo,
        serie: instrument.serie,
        descricao: instrument.descricao,
        fabricante: instrument.fabricante,
        modelo: instrument.modelo,
        setor: instrument.setor,
        responsavel: instrument.responsavel,
        data_aquisicao: instrument.data_aquisicao,
        periodicidade_dias: instrument.periodicidade_dias,
        status: instrument.status as "ativo" | "inativo" | "manutencao",
      });
    } else {
      form.reset();
    }
  }, [instrument, open, form]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{instrument ? "Editar Instrumento" : "Novo Instrumento"}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="codigo" render={({ field }) => (
                <FormItem>
                  <FormLabel>Código</FormLabel>
                  <FormControl><Input placeholder="PAQ-001" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="serie" render={({ field }) => (
                <FormItem>
                  <FormLabel>Nº Série</FormLabel>
                  <FormControl><Input placeholder="SN-2024-001" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>
            <FormField control={form.control} name="descricao" render={({ field }) => (
              <FormItem>
                <FormLabel>Descrição</FormLabel>
                <FormControl><Input placeholder="Paquímetro Digital 150mm" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="fabricante" render={({ field }) => (
                <FormItem>
                  <FormLabel>Fabricante</FormLabel>
                  <FormControl><Input placeholder="Mitutoyo" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="modelo" render={({ field }) => (
                <FormItem>
                  <FormLabel>Modelo</FormLabel>
                  <FormControl><Input placeholder="CD-6CSX" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="setor" render={({ field }) => (
                <FormItem>
                  <FormLabel>Setor</FormLabel>
                  <FormControl><Input placeholder="Usinagem" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="responsavel" render={({ field }) => (
                <FormItem>
                  <FormLabel>Responsável</FormLabel>
                  <FormControl><Input placeholder="Carlos Silva" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <FormField control={form.control} name="data_aquisicao" render={({ field }) => (
                <FormItem>
                  <FormLabel>Dt. Aquisição</FormLabel>
                  <FormControl><Input type="date" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="periodicidade_dias" render={({ field }) => (
                <FormItem>
                  <FormLabel>Periodicidade (dias)</FormLabel>
                  <FormControl><Input type="number" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="status" render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="ativo">Ativo</SelectItem>
                      <SelectItem value="inativo">Inativo</SelectItem>
                      <SelectItem value="manutencao">Manutenção</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Salvando..." : instrument ? "Salvar" : "Cadastrar"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
