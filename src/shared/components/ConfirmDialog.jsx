import { Button } from "./Button";
import { Modal } from "./Modal";

export function ConfirmDialog({ open, title, message, confirmLabel = "Delete", loading, onConfirm, onClose }) {
  return (
    <Modal open={open} onClose={onClose} title={title} size="sm">
      <p className="confirm-message text-sm leading-relaxed text-[#74676a]">{message}</p>
      <div className="modal-actions mt-4 flex items-center justify-end gap-2">
        <Button variant="ghost" onClick={onClose}>Cancel</Button>
        <Button variant="danger" loading={loading} onClick={onConfirm}>{confirmLabel}</Button>
      </div>
    </Modal>
  );
}
