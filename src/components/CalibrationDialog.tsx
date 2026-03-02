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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Instrument } from "@/hooks/useInstruments";

const schema = z.object({
  instrumento_id: z.string().min(1, "Selecione um instrumento"),
  data_calibracao: z.string().min(1, "Obrigatório"),
  resultado: z.enum(["aprovado", "reprovado"]),
  erro_medido: z.coerce.number().min(0, "Deve ser >= 0"),
  tolerancia: z.coerce.number().min(0, "Deve ser >= 0"),
  tecnico_nome: z.string().trim().min(1, "Obrigatório").max(100),
  observacoes: z.string().max(500).optional(),
});

export type CalibrationFormValues = z.infer<typeof schema>;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  instruments: Instrument[];
  onSubmit: (values: CalibrationFormValues) => void;
  isLoading?: boolean;
}

export function CalibrationDialog({ open, onOpenChange, instruments, onSubmit, isLoading }: Props) {
  const form = useForm<CalibrationFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      instrumento_id: "",
      data_calibracao: new Date().toISOString().split("T")[0],
      resultado: "aprovado",
      erro_medido: 0,
      tolerancia: 0,
      tecnico_nome: "",
      observacoes: "",
    },
  });

  useEffect(() => {
    if (open) form.reset();
  }, [open, form]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Registrar Calibração</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField control={form.control} name="instrumento_id" render={({ field }) => (
              <FormItem>
                <FormLabel>Instrumento</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {instruments.filter(i => i.status === "ativo").map((i) => (
                      <SelectItem key={i.id} value={i.id}>
                        {i.codigo} — {i.descricao}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )} />
            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="data_calibracao" render={({ field }) => (
                <FormItem>
                  <FormLabel>Data da Calibração</FormLabel>
                  <FormControl><Input type="date" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="resultado" render={({ field }) => (
                <FormItem>
                  <FormLabel>Resultado</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                    <SelectContent>
                      <SelectItem value="aprovado">Aprovado</SelectItem>
                      <SelectItem value="reprovado">Reprovado</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="erro_medido" render={({ field }) => (
                <FormItem>
                  <FormLabel>Erro Medido</FormLabel>
                  <FormControl><Input type="number" step="any" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="tolerancia" render={({ field }) => (
                <FormItem>
                  <FormLabel>Tolerância</FormLabel>
                  <FormControl><Input type="number" step="any" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>
            <FormField control={form.control} name="tecnico_nome" render={({ field }) => (
              <FormItem>
                <FormLabel>Técnico Responsável</FormLabel>
                <FormControl><Input placeholder="Nome do técnico" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="observacoes" render={({ field }) => (
              <FormItem>
                <FormLabel>Observações</FormLabel>
                <FormControl><Textarea placeholder="Observações opcionais..." {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Salvando..." : "Registrar"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
