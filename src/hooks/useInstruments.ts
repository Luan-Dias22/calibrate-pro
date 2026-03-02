import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables, TablesInsert, TablesUpdate } from "@/integrations/supabase/types";
import { toast } from "sonner";

export type Instrument = Tables<"instruments">;
export type InstrumentInsert = TablesInsert<"instruments">;
export type InstrumentUpdate = TablesUpdate<"instruments">;

export function useInstruments() {
  return useQuery({
    queryKey: ["instruments"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("instruments")
        .select("*")
        .order("codigo");
      if (error) throw error;
      return data as Instrument[];
    },
  });
}

export function useCreateInstrument() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (instrument: InstrumentInsert) => {
      const { data, error } = await supabase
        .from("instruments")
        .insert(instrument)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["instruments"] });
      toast.success("Instrumento cadastrado com sucesso!");
    },
    onError: (err: Error) => toast.error(`Erro ao cadastrar: ${err.message}`),
  });
}

export function useUpdateInstrument() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: InstrumentUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from("instruments")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["instruments"] });
      toast.success("Instrumento atualizado!");
    },
    onError: (err: Error) => toast.error(`Erro ao atualizar: ${err.message}`),
  });
}

export function useDeleteInstrument() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("instruments").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["instruments"] });
      toast.success("Instrumento removido!");
    },
    onError: (err: Error) => toast.error(`Erro ao remover: ${err.message}`),
  });
}
