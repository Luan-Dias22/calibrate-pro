import { Database, Shield, Users, FileText } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";

export default function Settings() {
  const { data: instrumentCount = 0, isLoading: loadingInst } = useQuery({
    queryKey: ["instruments-count"],
    queryFn: async () => {
      const { count, error } = await supabase
        .from("instruments")
        .select("*", { count: "exact", head: true });
      if (error) throw error;
      return count || 0;
    },
  });

  const { data: calibrationCount = 0, isLoading: loadingCal } = useQuery({
    queryKey: ["calibrations-count"],
    queryFn: async () => {
      const { count, error } = await supabase
        .from("calibrations")
        .select("*", { count: "exact", head: true });
      if (error) throw error;
      return count || 0;
    },
  });

  const { data: auditCount = 0, isLoading: loadingAudit } = useQuery({
    queryKey: ["audit-count"],
    queryFn: async () => {
      const { count, error } = await supabase
        .from("audit_logs")
        .select("*", { count: "exact", head: true });
      if (error) throw error;
      return count || 0;
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Configurações</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Informações do sistema e configurações gerais
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Database className="h-4 w-4 text-primary" />
              Banco de Dados
            </CardTitle>
            <CardDescription>Estatísticas do sistema</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Instrumentos</span>
              {loadingInst ? <Skeleton className="h-5 w-8" /> : (
                <Badge variant="secondary">{instrumentCount}</Badge>
              )}
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Calibrações</span>
              {loadingCal ? <Skeleton className="h-5 w-8" /> : (
                <Badge variant="secondary">{calibrationCount}</Badge>
              )}
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Logs de Auditoria</span>
              {loadingAudit ? <Skeleton className="h-5 w-8" /> : (
                <Badge variant="secondary">{auditCount}</Badge>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Shield className="h-4 w-4 text-primary" />
              Segurança
            </CardTitle>
            <CardDescription>Configurações de acesso</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Autenticação</span>
              <Badge variant="outline" className="border-success/30 text-success">Ativa</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">RLS</span>
              <Badge variant="outline" className="border-success/30 text-success">Habilitado</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Roles</span>
              <Badge variant="secondary">Admin, Técnico, Visualizador</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" />
              Perfis de Acesso
            </CardTitle>
            <CardDescription>Níveis de permissão do sistema</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <div className="flex items-start gap-2">
                <Badge className="mt-0.5">Admin</Badge>
                <span className="text-xs text-muted-foreground">Acesso total: cadastro, edição, exclusão, relatórios</span>
              </div>
              <div className="flex items-start gap-2">
                <Badge variant="secondary" className="mt-0.5">Técnico</Badge>
                <span className="text-xs text-muted-foreground">Registrar calibrações, editar instrumentos</span>
              </div>
              <div className="flex items-start gap-2">
                <Badge variant="outline" className="mt-0.5">Visualizador</Badge>
                <span className="text-xs text-muted-foreground">Somente visualização de dados e dashboard</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <FileText className="h-4 w-4 text-primary" />
              Sistema
            </CardTitle>
            <CardDescription>Informações da aplicação</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Versão</span>
              <span className="text-sm font-mono">1.0.0</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Backend</span>
              <span className="text-sm">Lovable Cloud</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Storage</span>
              <Badge variant="outline" className="border-success/30 text-success">Certificados</Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
