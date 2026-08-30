import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Armchair, Pencil, Plus, Trash2, Users } from "lucide-react";
import { apiClient, getApiError, getCollection } from "../../lib/apiClient";
import { Button } from "../../shared/components/Button";
import { ConfirmDialog } from "../../shared/components/ConfirmDialog";
import { PageHeader } from "../../shared/components/PageHeader";
import { EmptyState, ErrorState, LoadingState } from "../../shared/components/StateView";
import { StatusBadge } from "../../shared/components/StatusBadge";
import { useToast } from "../../shared/components/ToastProvider";
import { useAuth } from "../auth/AuthProvider";
import { useRestaurantScope } from "../restaurants/useRestaurantScope";
import { TableFormModal } from "./TableFormModal";

export default function TablesPage() {
  const { user } = useAuth();
  const { restaurantId, restaurant } = useRestaurantScope();
  const { showToast } = useToast();
  const queryClient = useQueryClient();
  const [status, setStatus] = useState("");
  const [form, setForm] = useState({ open: false, table: null });
  const [deleteTable, setDeleteTable] = useState(null);
  const canManage = ["owner", "platform_admin"].includes(user.role);
  const tablesQuery = useQuery({ queryKey: ["tables", restaurantId], queryFn: () => getCollection("/tables/", { limit: 500, restaurant: restaurantId || undefined }) });
  const restaurantsQuery = useQuery({ queryKey: ["restaurants", "options"], queryFn: () => getCollection("/restaurants/", { limit: 100 }), enabled: canManage && !restaurantId });
  const invalidate = () => { queryClient.invalidateQueries({ queryKey: ["tables"] }); queryClient.invalidateQueries({ queryKey: ["dashboard"] }); };
  const saveMutation = useMutation({ mutationFn: ({ data, table }) => table ? apiClient.patch(`/tables/${table.id}/`, data) : apiClient.post("/tables/", data), onSuccess: () => { invalidate(); setForm({ open: false, table: null }); showToast(form.table ? "Table updated." : "Table added."); }, onError: (error) => showToast(getApiError(error), "error") });
  const deleteMutation = useMutation({ mutationFn: (table) => apiClient.delete(`/tables/${table.id}/`), onSuccess: () => { invalidate(); setDeleteTable(null); showToast("Table deleted."); }, onError: (error) => showToast(getApiError(error), "error") });
  const tables = tablesQuery.data?.results || [];
  const restaurantOptions = restaurantId && restaurant ? [restaurant] : restaurantsQuery.data?.results || [];
  const visibleTables = useMemo(() => tables.filter((table) => !status || table.status === status), [tables, status]);

  return <div className="page-stack">
    <PageHeader title="Tables" description={canManage ? "See and update your floor." : "Pick an available table."} actions={canManage && <Button onClick={() => setForm({ open: true, table: null })}><Plus size={18} /> Add table</Button>} />
    <div className="status-tabs">{[["", "All"], ["available", "Available"], ["occupied", "Occupied"], ["reserved", "Reserved"], ["inactive", "Inactive"]].map(([value, label]) => <button key={label} className={status === value ? "is-active" : ""} onClick={() => setStatus(value)}>{label}{value && <span>{tables.filter((table) => table.status === value).length}</span>}</button>)}</div>
    {tablesQuery.isLoading ? <LoadingState label="Loading tables..." /> : tablesQuery.isError ? <ErrorState onRetry={tablesQuery.refetch} /> : visibleTables.length ? <section className="tables-grid">{visibleTables.map((table) => <article className={`table-card table-card--${table.status}`} key={table.id}><header><div className="table-card__icon"><Armchair /></div><StatusBadge status={table.status} /></header><div><span>{table.restaurant_name}</span><h2>Table {table.table_number}</h2><p><Users size={16} /> {table.capacity} seats</p></div>{canManage && <footer><button onClick={() => setForm({ open: true, table })}><Pencil size={16} /> Edit</button><button className="danger" onClick={() => setDeleteTable(table)}><Trash2 size={16} /></button></footer>}</article>)}</section> : <EmptyState title="No tables found" message={status ? `No tables are currently ${status}.` : "Add tables to build your restaurant floor."} />}
    <TableFormModal open={form.open} table={form.table} restaurants={restaurantOptions} loading={saveMutation.isPending} onClose={() => setForm({ open: false, table: null })} onSubmit={(data) => saveMutation.mutate({ data, table: form.table })} />
    <ConfirmDialog open={Boolean(deleteTable)} title={`Delete table ${deleteTable?.table_number}?`} message="This cannot be undone. A table with existing orders may not be safe to remove." loading={deleteMutation.isPending} onClose={() => setDeleteTable(null)} onConfirm={() => deleteMutation.mutate(deleteTable)} />
  </div>;
}
