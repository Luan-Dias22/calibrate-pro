import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Shield, Users } from "lucide-react";
import type { Database } from "@/integrations/supabase/types";

type AppRole = Database["public"]["Enums"]["app_role"];

interface UserWithRole {
  user_id: string;
  nome: string;
  email: string;
  role: AppRole;
  role_row_id: string;
}

const roleLabelMap: Record<AppRole, string> = {
  admin: "Admin",
  tecnico: "Técnico",
  visualizador: "Visualizador",
};

const roleBadgeVariant = (role: AppRole) => {
  switch (role) {
    case "admin": return "default" as const;
    case "tecnico": return "secondary" as const;
    default: return "outline" as const;
  }
};

export default function UserManagement() {
  const { role: currentRole, user } = useAuth();
  const queryClient = useQueryClient();
  const [editingUser, setEditingUser] = useState<string | null>(null);

  const { data: users = [], isLoading } = useQuery({
    queryKey: ["admin-users"],
    queryFn: async () => {
      const { data: profiles, error: pErr } = await supabase
        .from("profiles")
        .select("user_id, nome, email");
      if (pErr) throw pErr;

      const { data: roles, error: rErr } = await supabase
        .from("user_roles")
        .select("id, user_id, role");
      if (rErr) throw rErr;

      const roleMap = new Map(roles.map((r) => [r.user_id, { role: r.role, id: r.id }]));

      return (profiles || []).map((p) => ({
        user_id: p.user_id,
        nome: p.nome,
        email: p.email,
        role: roleMap.get(p.user_id)?.role ?? ("visualizador" as AppRole),
        role_row_id: roleMap.get(p.user_id)?.id ?? "",
      })) as UserWithRole[];
    },
    enabled: currentRole === "admin",
  });

  const updateRoleMutation = useMutation({
    mutationFn: async ({ userId, newRole }: { userId: string; newRole: AppRole }) => {
      const { error } = await supabase
        .from("user_roles")
        .update({ role: newRole })
        .eq("user_id", userId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      toast.success("Permissão atualizada com sucesso");
      setEditingUser(null);
    },
    onError: () => {
      toast.error("Erro ao atualizar permissão");
    },
  });

  if (currentRole !== "admin") {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Acesso restrito a administradores.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Shield className="h-6 w-6 text-primary" />
          Gerenciar Usuários
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Altere as permissões dos usuários do sistema
        </p>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Users className="h-4 w-4 text-primary" />
            Usuários Cadastrados
          </CardTitle>
          <CardDescription>
            Clique em "Editar" para alterar a permissão de um usuário
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : users.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              Nenhum usuário encontrado.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Permissão</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((u) => (
                  <TableRow key={u.user_id}>
                    <TableCell className="font-medium">{u.nome}</TableCell>
                    <TableCell className="text-muted-foreground">{u.email}</TableCell>
                    <TableCell>
                      {editingUser === u.user_id ? (
                        <Select
                          defaultValue={u.role}
                          onValueChange={(val) =>
                            updateRoleMutation.mutate({
                              userId: u.user_id,
                              newRole: val as AppRole,
                            })
                          }
                        >
                          <SelectTrigger className="w-[150px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="admin">Admin</SelectItem>
                            <SelectItem value="tecnico">Técnico</SelectItem>
                            <SelectItem value="visualizador">Visualizador</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        <Badge variant={roleBadgeVariant(u.role)}>
                          {roleLabelMap[u.role]}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {u.user_id === user?.id ? (
                        <span className="text-xs text-muted-foreground">Você</span>
                      ) : editingUser === u.user_id ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditingUser(null)}
                        >
                          Cancelar
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setEditingUser(u.user_id)}
                        >
                          Editar
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
