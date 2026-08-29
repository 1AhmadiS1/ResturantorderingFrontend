import { Clock3, ReceiptText, Table2, UserRound } from "lucide-react";
import { Button } from "../../shared/components/Button";
import { Modal } from "../../shared/components/Modal";
import { StatusBadge } from "../../shared/components/StatusBadge";
import { formatCurrency, formatDateTime, titleCase } from "../../shared/utils/formatters";

export function OrderDetailsModal({ order, transitions, onTransition, transitioning, onEdit, onClose }) {
  if (!order) return null;
  return (
    <Modal open={Boolean(order)} onClose={onClose} title={`Order #${order.id}`} description={`${order.restaurant_name} · ${formatDateTime(order.created_at)}`} size="lg">
      <div className="order-meta"><div><Table2 /><span>Table<strong>{order.table_number}</strong></span></div><div><UserRound /><span>Waiter<strong>{order.waiter_email || "Created by management"}</strong></span></div><div><Clock3 /><span>Status<StatusBadge status={order.status} /></span></div></div>
      <div className="order-detail-items"><h3><ReceiptText size={18} /> Items</h3>{order.items.map((item) => <div key={item.id || item.menu_item}><span><strong>{item.quantity}×</strong> {item.menu_item_name}</span><b>{formatCurrency(item.line_total)}</b></div>)}<footer><span>Total</span><strong>{formatCurrency(order.total_price)}</strong></footer></div>
      {order.note && <div className="order-note"><strong>Order note</strong><p>{order.note}</p></div>}
      <div className="modal-actions modal-actions--wrap">
        {onEdit && <Button variant="secondary" onClick={onEdit}>Edit items</Button>}
        <span className="modal-actions__spacer" />
        <Button variant="ghost" onClick={onClose}>Close</Button>
        {transitions.map((status) => <Button key={status} variant={status === "cancelled" ? "danger" : "primary"} loading={transitioning === status} onClick={() => onTransition(status)}>{titleCase(status)}</Button>)}
      </div>
    </Modal>
  );
}

