import { Check, Clock3, ReceiptText, Table2, UserRound } from "lucide-react";
import { Button } from "../../shared/components/Button";
import { Modal } from "../../shared/components/Modal";
import { StatusBadge } from "../../shared/components/StatusBadge";
import { formatCurrency, formatDateTime } from "../../shared/utils/formatters";

const lifecycle = ["pending", "preparing", "ready", "served"];

const transitionLabels = {
  preparing: "Start preparing",
  ready: "Mark ready",
  served: "Mark served",
  cancelled: "Cancel order",
};

export function OrderDetailsModal({ order, transitions, onTransition, transitioning, onEdit, onClose }) {
  if (!order) return null;

  const currentStep = lifecycle.indexOf(order.status);
  const nextTransition = transitions.find((status) => status !== "cancelled");
  const canCancel = transitions.includes("cancelled");

  return (
    <Modal
      open={Boolean(order)}
      onClose={onClose}
      title={`Order #${order.id}`}
      description={`${order.restaurant_name} • ${formatDateTime(order.created_at)}`}
      size="lg"
    >
      <div className={`order-progress ${order.status === "cancelled" ? "is-cancelled" : ""}`}>
        {lifecycle.map((status, index) => (
          <div key={status} className={index < currentStep ? "is-complete" : index === currentStep ? "is-current" : ""}>
            <span>{index < currentStep ? <Check size={14} /> : index + 1}</span>
            <small>{status === "pending" ? "New" : status}</small>
          </div>
        ))}
      </div>

      <div className="order-meta">
        <div><Table2 /><span>Table<strong>{order.table_number}</strong></span></div>
        <div><UserRound /><span>Waiter<strong>{order.waiter_email || "Management"}</strong></span></div>
        <div><Clock3 /><span>Status<StatusBadge status={order.status} /></span></div>
      </div>

      <div className="order-detail-items">
        <h3><ReceiptText size={18} /> Order items</h3>
        {order.items.map((item) => (
          <div key={item.id || item.menu_item}>
            <span>
              <strong>{item.quantity}×</strong>
              <span>{item.menu_item_name}<small>{item.price ? `${formatCurrency(item.price)} each` : ""}</small></span>
            </span>
            <b>{formatCurrency(item.line_total)}</b>
          </div>
        ))}
        <footer><span>Total</span><strong>{formatCurrency(order.total_price)}</strong></footer>
      </div>

      {order.note && <div className="order-note"><strong>Kitchen note</strong><p>{order.note}</p></div>}

      <div className="modal-actions modal-actions--wrap order-detail-actions">
        {onEdit && <Button variant="secondary" onClick={onEdit}>Edit items</Button>}
        <span className="modal-actions__spacer" />
        <Button variant="ghost" onClick={onClose}>Close</Button>
        {canCancel && (
          <Button variant="danger" loading={transitioning === "cancelled"} onClick={() => onTransition("cancelled")}>Cancel order</Button>
        )}
        {nextTransition && (
          <Button loading={transitioning === nextTransition} onClick={() => onTransition(nextTransition)}>
            {transitionLabels[nextTransition]}
          </Button>
        )}
      </div>
    </Modal>
  );
}
