import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables, TablesInsert } from "@/integrations/supabase/types";
import { toast } from "sonner";

export type Calibration = Tables<"calibrations">;
export type CalibrationInsert = TablesInsert<"calibrations">;

export function useCalibrations() {
  return useQuery({
    queryKey: ["calibrations"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("calibrations")
        .select("*, instruments(codigo, descricao)")
        .order("data_calibracao", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

export function useCreateCalibration() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (cal: CalibrationInsert) => {
      const { data, error } = await supabase
        .from("calibrations")
        .insert(cal)
        .select()
        .single();
      if (error) throw error;

      // Update instrument dates
      await supabase
        .from("instruments")
        .update({
          ultima_calibracao: cal.data_calibracao,
          proxima_calibracao: cal.proxima_calibracao,
        })
        .eq("id", cal.instrumento_id);

      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["calibrations"] });
      qc.invalidateQueries({ queryKey: ["instruments"] });
      toast.success("Calibração registrada com sucesso!");
    },
    onError: (err: Error) => toast.error(`Erro ao registrar: ${err.message}`),
  });
}
