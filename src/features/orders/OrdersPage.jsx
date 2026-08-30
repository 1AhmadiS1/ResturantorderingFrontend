import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Ban,
  CheckCircle2,
  ChefHat,
  Clock3,
  Eye,
  Pencil,
  Plus,
  ReceiptText,
  Trash2,
  Utensils,
} from "lucide-react";
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
import { formatCurrency, formatRelativeTime } from "../../shared/utils/formatters";
import { useAuth } from "../auth/AuthProvider";
import { useRestaurantScope } from "../restaurants/useRestaurantScope";
import { allowedTransitions } from "./orderRules";
import { OrderDetailsModal } from "./OrderDetailsModal";
import { OrderFormModal } from "./OrderFormModal";

const PAGE_SIZE = 10;

const STATUS_FILTERS = [
  { value: "", label: "All", icon: ReceiptText },
  { value: "pending", label: "New", icon: Clock3 },
  { value: "preparing", label: "Cooking", icon: ChefHat },
  { value: "ready", label: "Ready", icon: Utensils },
  { value: "served", label: "Served", icon: CheckCircle2 },
  { value: "cancelled", label: "Cancelled", icon: Ban },
];

function OrderItemsPreview({ items, compact = false }) {
  const visibleItems = items.slice(0, compact ? 2 : 3);
  const remaining = items.length - visibleItems.length;

  return (
    <div className="order-items-preview">
      {visibleItems.map((item) => (
        <span key={item.id || item.menu_item}>
          <strong>{item.quantity}×</strong> {item.menu_item_name}
        </span>
      ))}
      {remaining > 0 && <small>+{remaining} more</small>}
    </div>
  );
}

function ManagementOrderRow({ order, canEdit, canDelete, onView, onEdit, onDelete }) {
  return (
    <article className={`management-order management-order--${order.status}`}>
      <button type="button" className="management-order__open" onClick={() => onView(order)} aria-label={`View order ${order.id}`}>
        <span className="management-order__identity">
          <strong>#{order.id}</strong>
          <b>Table {order.table_number}</b>
        </span>
        <span className="management-order__restaurant">
          <strong>{order.restaurant_name}</strong>
          <small>{order.waiter_email || "Management"}</small>
        </span>
        <OrderItemsPreview items={order.items} compact />
        <span className="management-order__status">
          <StatusBadge status={order.status} />
          <small>{formatRelativeTime(order.created_at)}</small>
        </span>
        <strong className="management-order__total">{formatCurrency(order.total_price)}</strong>
      </button>
      <div className="row-actions management-order__actions">
        <button onClick={() => onView(order)} title="View order" aria-label={`View order ${order.id}`}><Eye size={17} /></button>
        {canEdit && <button onClick={() => onEdit(order)} title="Edit order" aria-label={`Edit order ${order.id}`}><Pencil size={17} /></button>}
        {canDelete && <button className="danger" onClick={() => onDelete(order)} title="Delete order" aria-label={`Delete order ${order.id}`}><Trash2 size={17} /></button>}
      </div>
    </article>
  );
}

function ServiceOrderCard({ order, canEdit, serving, onView, onEdit, onServe }) {
  return (
    <article className={`service-order-card service-order-card--${order.status}`}>
      <header>
        <span>Order #{order.id}</span>
        <StatusBadge status={order.status} />
      </header>
      <button type="button" className="service-order-card__body" onClick={() => onView(order)}>
        <div className="service-order-card__headline">
          <div>
            <small>Table</small>
            <h2>{order.table_number}</h2>
          </div>
          <strong>{formatCurrency(order.total_price)}</strong>
        </div>
        <OrderItemsPreview items={order.items} />
        <span className="service-order-card__time"><Clock3 size={15} /> {formatRelativeTime(order.created_at)}</span>
      </button>
      <footer>
        <Button variant="secondary" size="sm" onClick={() => onView(order)}><Eye size={16} /> View</Button>
        {canEdit && <Button variant="ghost" size="sm" onClick={() => onEdit(order)}><Pencil size={15} /> Edit</Button>}
        {order.status === "ready" && <Button size="sm" loading={serving} onClick={() => onServe(order)}><CheckCircle2 size={16} /> Mark served</Button>}
      </footer>
    </article>
  );
}

export default function OrdersPage() {
  const { user } = useAuth();
  const { restaurantId } = useRestaurantScope();
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
  const [transitioning, setTransitioning] = useState(null);
  const debouncedSearch = useDebouncedValue(search);
  const isManager = ["platform_admin", "owner"].includes(user.role);
  const canCreate = ["platform_admin", "owner", "waiter"].includes(user.role);
  const canDelete = isManager;

  const ordersQuery = useQuery({
    queryKey: ["orders", "list", { restaurantId, search: debouncedSearch, status, offset }],
    queryFn: () => getCollection("/orders/", {
      search: debouncedSearch || undefined,
      status: status || undefined,
      restuarant: restaurantId || undefined,
      ordering: "-created_at",
      limit: PAGE_SIZE,
      offset,
    }),
  });

  const overviewQuery = useQuery({
    queryKey: ["orders", "overview", restaurantId],
    queryFn: () => getCollection("/orders/", { ordering: "-created_at", limit: 500, restuarant: restaurantId || undefined }),
  });

  const statusCounts = useMemo(() => {
    const orders = overviewQuery.data?.results || [];
    return STATUS_FILTERS.reduce((counts, option) => ({
      ...counts,
      [option.value || "all"]: option.value
        ? orders.filter((order) => order.status === option.value).length
        : overviewQuery.data?.count ?? orders.length,
    }), {});
  }, [overviewQuery.data]);

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["orders"] });

  const saveMutation = useMutation({
    mutationFn: ({ payload, order }) => order
      ? apiClient.patch(`/orders/${order.id}/`, payload)
      : apiClient.post("/orders/", payload),
    onSuccess: () => {
      invalidate();
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      setFormOpen(false);
      setFormOrder(null);
      showToast(formOrder ? "Order updated." : "Order sent to the kitchen.");
    },
    onError: (error) => showToast(getApiError(error), "error"),
  });

  const transitionMutation = useMutation({
    mutationFn: ({ order, status: nextStatus }) => apiClient.patch(`/orders/${order.id}/`, { status: nextStatus }),
    onSuccess: ({ data }) => {
      invalidate();
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      setSelectedOrder((current) => current?.id === data.id ? data : current);
      showToast(`Order #${data.id} is now ${data.status}.`);
    },
    onError: (error) => showToast(getApiError(error), "error"),
    onSettled: () => setTransitioning(null),
  });

  const deleteMutation = useMutation({
    mutationFn: (order) => apiClient.delete(`/orders/${order.id}/`),
    onSuccess: () => { invalidate(); setDeleteOrder(null); showToast("Order deleted."); },
    onError: (error) => showToast(getApiError(error), "error"),
  });

  const transitionOrder = (order, nextStatus) => {
    setTransitioning({ orderId: order.id, status: nextStatus });
    transitionMutation.mutate({ order, status: nextStatus });
  };

  const openEdit = (order) => {
    setSelectedOrder(null);
    setFormOrder(order);
    setFormOpen(true);
  };

  const activeFilter = STATUS_FILTERS.find((option) => option.value === status);
  const orders = ordersQuery.data?.results || [];

  return (
    <div className="page-stack orders-page">
      <PageHeader
        title={isManager ? "Order overview" : "Service orders"}
        description={isManager ? "See every order at a glance." : "Take orders and serve ready tables."}
        actions={canCreate && (
          <Button
            variant={user.role === "platform_admin" ? "secondary" : "primary"}
            onClick={() => { setFormOrder(null); setFormOpen(true); setSearchParams({}); }}
          >
            <Plus size={18} /> New order
          </Button>
        )}
      />

      <div className="orders-status-strip" role="tablist" aria-label="Filter orders by status">
        {STATUS_FILTERS.map(({ value, label, icon: Icon }) => (
          <button
            key={value || "all"}
            type="button"
            role="tab"
            aria-selected={status === value}
            className={status === value ? "is-active" : ""}
            onClick={() => { setStatus(value); setOffset(0); }}
          >
            <Icon size={19} />
            <span><strong>{label}</strong><small>{overviewQuery.isLoading ? "—" : statusCounts[value || "all"]}</small></span>
          </button>
        ))}
      </div>

      <div className="orders-toolbar">
        <SearchField value={search} onChange={(value) => { setSearch(value); setOffset(0); }} placeholder="Search orders" />
        <span>{ordersQuery.data?.count ?? 0} {activeFilter?.label.toLowerCase() || ""} order{ordersQuery.data?.count === 1 ? "" : "s"}</span>
      </div>

      <section className={`orders-workspace ${isManager ? "orders-workspace--manager" : "orders-workspace--service"}`}>
        {ordersQuery.isLoading ? (
          <LoadingState label="Loading orders..." />
        ) : ordersQuery.isError ? (
          <ErrorState onRetry={ordersQuery.refetch} />
        ) : orders.length ? (
          <>
            {isManager ? (
              <div className="management-order-list">
                <div className="management-order-list__labels" aria-hidden="true">
                  <span>Order</span><span>Restaurant</span><span>Items</span><span>Status</span><span>Total</span><span />
                </div>
                {orders.map((order) => (
                  <ManagementOrderRow
                    key={order.id}
                    order={order}
                    canEdit={order.status === "pending" && canCreate}
                    canDelete={canDelete}
                    onView={setSelectedOrder}
                    onEdit={openEdit}
                    onDelete={setDeleteOrder}
                  />
                ))}
              </div>
            ) : (
              <div className="service-order-grid">
                {orders.map((order) => (
                  <ServiceOrderCard
                    key={order.id}
                    order={order}
                    canEdit={order.status === "pending" && canCreate}
                    serving={transitioning?.orderId === order.id && transitioning?.status === "served"}
                    onView={setSelectedOrder}
                    onEdit={openEdit}
                    onServe={(currentOrder) => transitionOrder(currentOrder, "served")}
                  />
                ))}
              </div>
            )}
            <Pagination count={ordersQuery.data.count} offset={offset} limit={PAGE_SIZE} onChange={setOffset} />
          </>
        ) : (
          <EmptyState
            title="No orders here"
            message={search || status ? "Try another filter." : "Create the first order."}
            action={canCreate && !search && !status ? <Button onClick={() => setFormOpen(true)}><Plus size={17} /> New order</Button> : null}
          />
        )}
      </section>

      <OrderFormModal
        open={formOpen}
        order={formOrder}
        restaurantId={restaurantId}
        loading={saveMutation.isPending}
        onClose={() => { setFormOpen(false); setFormOrder(null); setSearchParams({}); }}
        onSubmit={(payload) => saveMutation.mutate({ payload, order: formOrder })}
      />

      <OrderDetailsModal
        order={selectedOrder}
        transitions={selectedOrder ? allowedTransitions(selectedOrder.status, user.role) : []}
        transitioning={transitioning && selectedOrder && transitioning.orderId === selectedOrder.id ? transitioning.status : ""}
        onTransition={(nextStatus) => transitionOrder(selectedOrder, nextStatus)}
        onEdit={selectedOrder?.status === "pending" && canCreate ? () => openEdit(selectedOrder) : null}
        onClose={() => setSelectedOrder(null)}
      />

      <ConfirmDialog
        open={Boolean(deleteOrder)}
        title={`Delete order #${deleteOrder?.id}?`}
        message="This permanently removes the order and its items."
        loading={deleteMutation.isPending}
        onClose={() => setDeleteOrder(null)}
        onConfirm={() => deleteMutation.mutate(deleteOrder)}
      />
    </div>
  );
}
