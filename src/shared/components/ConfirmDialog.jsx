import { Button } from "./Button";
import { Modal } from "./Modal";

export function ConfirmDialog({ open, title, message, confirmLabel = "Delete", loading, onConfirm, onClose }) {
  return (
    <Modal open={open} onClose={onClose} title={title} size="sm">
      <p className="confirm-message">{message}</p>
      <div className="modal-actions">
        <Button variant="ghost" onClick={onClose}>Cancel</Button>
        <Button variant="danger" loading={loading} onClick={onConfirm}>{confirmLabel}</Button>
      </div>
    </Modal>
  );
}

