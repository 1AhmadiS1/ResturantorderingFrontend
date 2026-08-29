import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Eye, Pencil, Plus, Trash2 } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import { apiClient, getApiError, getCollection } from "../../lib/apiClient";
import { Button } from "../../shared/components/Button";
import { ConfirmDialog } from "../../shared/components/ConfirmDialog";
import { PageHeader } from "../../shared/components/PageHeader";
import { Pagination } from "../../shared/components/Pagination";
import { SearchField } from "../../shared/components/SearchField";
import { EmptyState, ErrorState, LoadingState } from "../../shared/components/StateView";
import { StatusBadge } from "../../shared/components/StatusBadge";
import { useToast } from "../../shared/components/ToastProvider";
import { useDebouncedValue } from "../../shared/hooks/useDebouncedValue";
import { formatCurrency, formatDateTime } from "../../shared/utils/formatters";
import { useAuth } from "../auth/AuthProvider";
import { allowedTransitions } from "./orderRules";
import { OrderDetailsModal } from "./OrderDetailsModal";
import { OrderFormModal } from "./OrderFormModal";

const PAGE_SIZE = 10;

export default function OrdersPage() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [offset, setOffset] = useState(0);
  const [formOrder, setFormOrder] = useState(null);
  const [formOpen, setFormOpen] = useState(searchParams.get("create") === "1");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [deleteOrder, setDeleteOrder] = useState(null);
  const [transitioning, setTransitioning] = useState("");
  const debouncedSearch = useDebouncedValue(search);
  const canCreate = ["platform_admin", "owner", "waiter"].includes(user.role);
  const canDelete = ["platform_admin", "owner"].includes(user.role);

  useEffect(() => { setOffset(0); }, [debouncedSearch, status]);
  const ordersQuery = useQuery({
    queryKey: ["orders", { search: debouncedSearch, status, offset }],
    queryFn: () => getCollection("/orders/", { search: debouncedSearch || undefined, status: status || undefined, ordering: "-created_at", limit: PAGE_SIZE, offset }),
  });
  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["orders"] });
  const saveMutation = useMutation({
    mutationFn: ({ payload, order }) => order ? apiClient.patch(`/orders/${order.id}/`, payload) : apiClient.post("/orders/", payload),
    onSuccess: () => { invalidate(); queryClient.invalidateQueries({ queryKey: ["dashboard"] }); setFormOpen(false); setFormOrder(null); showToast(formOrder ? "Order updated." : "Order created and sent to the kitchen."); },
    onError: (error) => showToast(getApiError(error), "error"),
  });
  const transitionMutation = useMutation({
    mutationFn: ({ order, status: nextStatus }) => apiClient.patch(`/orders/${order.id}/`, { status: nextStatus }),
    onSuccess: ({ data }) => { invalidate(); queryClient.invalidateQueries({ queryKey: ["dashboard"] }); setSelectedOrder(data); showToast(`Order #${data.id} is now ${data.status}.`); },
    onError: (error) => showToast(getApiError(error), "error"),
    onSettled: () => setTransitioning(""),
  });
  const deleteMutation = useMutation({
    mutationFn: (order) => apiClient.delete(`/orders/${order.id}/`),
    onSuccess: () => { invalidate(); setDeleteOrder(null); showToast("Order deleted."); },
    onError: (error) => showToast(getApiError(error), "error"),
  });

  const handleTransition = (nextStatus) => { setTransitioning(nextStatus); transitionMutation.mutate({ order: selectedOrder, status: nextStatus }); };
  const openEdit = (order) => { setSelectedOrder(null); setFormOrder(order); setFormOpen(true); };

  return <div className="page-stack">
    <PageHeader eyebrow="Live service" title="Orders" description="Create orders, follow their progress, and keep service moving." actions={canCreate && <Button onClick={() => { setFormOrder(null); setFormOpen(true); setSearchParams({}); }}><Plus size={18} /> New order</Button>} />
    <div className="toolbar"><SearchField value={search} onChange={setSearch} placeholder="Search notes, restaurant, or waiter..." /><select value={status} onChange={(event) => setStatus(event.target.value)}><option value="">All statuses</option><option value="pending">Pending</option><option value="preparing">Preparing</option><option value="ready">Ready</option><option value="served">Served</option><option value="cancelled">Cancelled</option></select></div>
    <section className="panel panel--flush">
      {ordersQuery.isLoading ? <LoadingState label="Loading orders..." /> : ordersQuery.isError ? <ErrorState onRetry={ordersQuery.refetch} /> : ordersQuery.data.results.length ? <>
        <div className="data-table-wrap"><table className="data-table"><thead><tr><th>Order</th><th>Table</th><th>Items</th><th>Status</th><th>Created</th><th>Total</th><th><span className="sr-only">Actions</span></th></tr></thead><tbody>{ordersQuery.data.results.map((order) => <tr key={order.id}><td><strong>#{order.id}</strong><small>{order.restaurant_name}</small></td><td>Table {order.table_number}</td><td>{order.items.length} item{order.items.length === 1 ? "" : "s"}</td><td><StatusBadge status={order.status} /></td><td>{formatDateTime(order.created_at)}</td><td><strong>{formatCurrency(order.total_price)}</strong></td><td><div className="row-actions"><button onClick={() => setSelectedOrder(order)} title="View"><Eye size={17} /></button>{order.status === "pending" && canCreate && <button onClick={() => openEdit(order)} title="Edit"><Pencil size={17} /></button>}{canDelete && <button className="danger" onClick={() => setDeleteOrder(order)} title="Delete"><Trash2 size={17} /></button>}</div></td></tr>)}</tbody></table></div>
        <div className="mobile-list">{ordersQuery.data.results.map((order) => <article className="mobile-order-card" key={order.id} onClick={() => setSelectedOrder(order)}><div><strong>#{order.id}</strong><StatusBadge status={order.status} /></div><h3>Table {order.table_number}</h3><p>{order.items.length} items · {formatDateTime(order.created_at)}</p><b>{formatCurrency(order.total_price)}</b></article>)}</div>
        <Pagination count={ordersQuery.data.count} offset={offset} limit={PAGE_SIZE} onChange={setOffset} />
      </> : <EmptyState title="No orders found" message={search || status ? "Try changing your search or filter." : "Create the first order to begin service."} action={canCreate && !search && !status ? <Button onClick={() => setFormOpen(true)}><Plus size={17} /> New order</Button> : null} />}
    </section>
    <OrderFormModal open={formOpen} order={formOrder} loading={saveMutation.isPending} onClose={() => { setFormOpen(false); setFormOrder(null); setSearchParams({}); }} onSubmit={(payload) => saveMutation.mutate({ payload, order: formOrder })} />
    <OrderDetailsModal order={selectedOrder} transitions={selectedOrder ? allowedTransitions(selectedOrder.status, user.role) : []} transitioning={transitioning} onTransition={handleTransition} onEdit={selectedOrder?.status === "pending" && canCreate ? () => openEdit(selectedOrder) : null} onClose={() => setSelectedOrder(null)} />
    <ConfirmDialog open={Boolean(deleteOrder)} title={`Delete order #${deleteOrder?.id}?`} message="This permanently removes the order and all of its items." loading={deleteMutation.isPending} onClose={() => setDeleteOrder(null)} onConfirm={() => deleteMutation.mutate(deleteOrder)} />
  </div>;
}
