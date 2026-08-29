import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ChefHat, Clock3, RefreshCw, Utensils } from "lucide-react";
import { apiClient, getApiError, getCollection } from "../../lib/apiClient";
import { Button } from "../../shared/components/Button";
import { PageHeader } from "../../shared/components/PageHeader";
import { EmptyState, ErrorState, LoadingState } from "../../shared/components/StateView";
import { StatusBadge } from "../../shared/components/StatusBadge";
import { useToast } from "../../shared/components/ToastProvider";
import { formatRelativeTime, titleCase } from "../../shared/utils/formatters";
import { useAuth } from "../auth/AuthProvider";
import { allowedTransitions } from "../orders/orderRules";

export default function KitchenPage() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState("active");
  const [updatingId, setUpdatingId] = useState(null);
  const ordersQuery = useQuery({
    queryKey: ["kitchen-orders"],
    queryFn: () => getCollection("/orders/", { limit: 500, ordering: "created_at" }),
    refetchInterval: 15_000,
  });
  const mutation = useMutation({
    mutationFn: ({ id, status }) => apiClient.patch(`/orders/${id}/`, { status }),
    onSuccess: ({ data }) => { queryClient.invalidateQueries({ queryKey: ["kitchen-orders"] }); queryClient.invalidateQueries({ queryKey: ["orders"] }); showToast(`Order #${data.id} moved to ${data.status}.`); },
    onError: (error) => showToast(getApiError(error), "error"),
    onSettled: () => setUpdatingId(null),
  });

  const visibleOrders = useMemo(() => {
    const orders = ordersQuery.data?.results || [];
    if (filter === "active") return orders.filter((order) => ["pending", "preparing"].includes(order.status));
    return orders.filter((order) => order.status === filter);
  }, [ordersQuery.data, filter]);

  const updateStatus = (order, status) => { setUpdatingId(order.id); mutation.mutate({ id: order.id, status }); };

  return <div className="page-stack kitchen-page">
    <PageHeader eyebrow="Kitchen display" title="Kitchen queue" description="Tickets refresh automatically every 15 seconds so the team stays in sync." actions={<Button variant="secondary" onClick={() => ordersQuery.refetch()}><RefreshCw size={17} className={ordersQuery.isFetching ? "spin" : ""} /> Refresh</Button>} />
    <div className="status-tabs" role="tablist">{[["active", "In progress"], ["pending", "Pending"], ["preparing", "Preparing"], ["ready", "Ready"]].map(([value, label]) => <button key={value} className={filter === value ? "is-active" : ""} onClick={() => setFilter(value)}>{label}</button>)}</div>
    {ordersQuery.isLoading ? <LoadingState label="Loading the kitchen queue..." /> : ordersQuery.isError ? <ErrorState onRetry={ordersQuery.refetch} /> : visibleOrders.length ? <section className="kitchen-grid">
      {visibleOrders.map((order) => {
        const transitions = allowedTransitions(order.status, user.role).filter((status) => status !== "served");
        return <article className={`kitchen-ticket kitchen-ticket--${order.status}`} key={order.id}>
          <header><div><span>Order #{order.id}</span><h2>Table {order.table_number}</h2></div><StatusBadge status={order.status} /></header>
          <div className="kitchen-ticket__time"><Clock3 size={16} /><span>{formatRelativeTime(order.created_at)}</span></div>
          <div className="kitchen-ticket__items">{order.items.map((item) => <div key={item.id || item.menu_item}><strong>{item.quantity}</strong><span>{item.menu_item_name}</span></div>)}</div>
          {order.note && <div className="kitchen-ticket__note"><strong>Note</strong><p>{order.note}</p></div>}
          <footer>{transitions.length ? transitions.map((status) => <Button key={status} variant={status === "cancelled" ? "ghost" : "primary"} loading={updatingId === order.id && mutation.isPending} onClick={() => updateStatus(order, status)}>{status === "preparing" ? <><ChefHat size={17} /> Start preparing</> : status === "ready" ? <><Utensils size={17} /> Mark ready</> : titleCase(status)}</Button>) : <span className="kitchen-ticket__waiting">Waiting for service</span>}</footer>
        </article>;
      })}
    </section> : <EmptyState title="Kitchen is clear" message={filter === "active" ? "There are no pending or preparing orders right now." : `No ${filter} orders right now.`} />}
  </div>;
}

