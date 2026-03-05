import { useEffect, useRef, useState } from "react";
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
import { Upload, FileText, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Instrument } from "@/hooks/useInstruments";

const schema = z.object({
  instrumento_id: z.string().min(1, "Selecione um instrumento"),
  data_calibracao: z.string().min(1, "Obrigatório"),
  resultado: z.enum(["aprovado", "reprovado"]),
  tecnico_nome: z.string().trim().min(1, "Obrigatório").max(100),
  proxima_calibracao: z.string().min(1, "Obrigatório"),
  observacoes: z.string().max(500).optional(),
});

export type CalibrationFormValues = z.infer<typeof schema> & {
  certificado_url?: string | null;
};

export interface CalibrationDefaultValues {
  id?: string;
  instrumento_id?: string;
  data_calibracao?: string;
  resultado?: "aprovado" | "reprovado";
  tecnico_nome?: string;
  proxima_calibracao?: string;
  observacoes?: string;
  certificado_url?: string | null;
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  instruments: Instrument[];
  onSubmit: (values: CalibrationFormValues) => void;
  isLoading?: boolean;
  defaultValues?: CalibrationDefaultValues;
  title?: string;
}

export function CalibrationDialog({ open, onOpenChange, instruments, onSubmit, isLoading, defaultValues, title }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isEdit = !!defaultValues?.id;

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      instrumento_id: "",
      data_calibracao: new Date().toISOString().split("T")[0],
      resultado: "aprovado",
      tecnico_nome: "",
      proxima_calibracao: "",
      observacoes: "",
    },
  });

  useEffect(() => {
    if (open) {
      if (defaultValues) {
        form.reset({
          instrumento_id: defaultValues.instrumento_id || "",
          data_calibracao: defaultValues.data_calibracao || new Date().toISOString().split("T")[0],
          resultado: defaultValues.resultado || "aprovado",
          tecnico_nome: defaultValues.tecnico_nome || "",
          proxima_calibracao: defaultValues.proxima_calibracao || "",
          observacoes: defaultValues.observacoes || "",
        });
      } else {
        form.reset();
      }
      setFile(null);
    }
  }, [open, form, defaultValues]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;
    if (selected.type !== "application/pdf") {
      toast.error("Apenas arquivos PDF são permitidos.");
      return;
    }
    if (selected.size > 10 * 1024 * 1024) {
      toast.error("O arquivo deve ter no máximo 10MB.");
      return;
    }
    setFile(selected);
  };

  const handleSubmit = async (values: z.infer<typeof schema>) => {
    let certificado_url: string | null = null;

    if (file) {
      setUploading(true);
      const timestamp = Date.now();
      const filePath = `${values.instrumento_id}/${timestamp}_${file.name}`;

      const { error: uploadError } = await supabase.storage
        .from("certificados")
        .upload(filePath, file, { contentType: "application/pdf" });

      if (uploadError) {
        toast.error(`Erro no upload: ${uploadError.message}`);
        setUploading(false);
        return;
      }

      const { data: urlData } = supabase.storage
        .from("certificados")
        .getPublicUrl(filePath);

      certificado_url = urlData.publicUrl;
      setUploading(false);
    }

    onSubmit({ ...values, certificado_url });
  };

  const busy = isLoading || uploading;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{title || (isEdit ? "Editar Calibração" : "Registrar Calibração")}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
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
            <FormField control={form.control} name="proxima_calibracao" render={({ field }) => (
              <FormItem>
                <FormLabel>Próxima Calibração</FormLabel>
                <FormControl><Input type="date" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="tecnico_nome" render={({ field }) => (
              <FormItem>
                <FormLabel>Técnico Responsável</FormLabel>
                <FormControl><Input placeholder="Nome do técnico" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            {/* File Upload */}
            <div className="space-y-2">
              <FormLabel>Certificado (PDF)</FormLabel>
              <input
                ref={fileInputRef}
                type="file"
                accept="application/pdf"
                className="hidden"
                onChange={handleFileChange}
              />
              {file ? (
                <div className="flex items-center gap-2 rounded-md border border-border bg-muted/50 p-3">
                  <FileText className="h-5 w-5 text-primary shrink-0" />
                  <span className="text-sm truncate flex-1">{file.name}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => { setFile(null); if (fileInputRef.current) fileInputRef.current.value = ""; }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  className="w-full gap-2"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="h-4 w-4" />
                  Selecionar PDF
                </Button>
              )}
              <p className="text-xs text-muted-foreground">Máximo 10MB. Opcional.</p>
            </div>

            <FormField control={form.control} name="observacoes" render={({ field }) => (
              <FormItem>
                <FormLabel>Observações</FormLabel>
                <FormControl><Textarea placeholder="Observações opcionais..." {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
              <Button type="submit" disabled={busy}>
                {uploading ? "Enviando..." : isLoading ? "Salvando..." : isEdit ? "Salvar" : "Registrar"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
