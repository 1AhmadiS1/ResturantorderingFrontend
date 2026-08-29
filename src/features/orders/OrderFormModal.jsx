import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { getCollection } from "../../lib/apiClient";
import { Button } from "../../shared/components/Button";
import { FormField } from "../../shared/components/FormField";
import { Modal } from "../../shared/components/Modal";
import { LoadingState } from "../../shared/components/StateView";
import { formatCurrency } from "../../shared/utils/formatters";

export function OrderFormModal({ open, order, onClose, onSubmit, loading }) {
  const [selectedItems, setSelectedItems] = useState([]);
  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm();
  const tablesQuery = useQuery({ queryKey: ["order-form", "tables"], queryFn: () => getCollection("/tables/", { limit: 500 }), enabled: open });
  const menusQuery = useQuery({ queryKey: ["order-form", "menus"], queryFn: () => getCollection("/menu/", { limit: 100 }), enabled: open });
  const itemsQuery = useQuery({ queryKey: ["order-form", "items"], queryFn: () => getCollection("/menuitems/", { limit: 500, ordering: "name" }), enabled: open });

  useEffect(() => {
    if (!open) return;
    reset({ table: order?.table || "", note: order?.note || "" });
    setSelectedItems(order?.items?.map((item) => ({ menu_item: item.menu_item, quantity: item.quantity })) || []);
  }, [open, order, reset]);

  const menuItems = itemsQuery.data?.results || [];
  const selectedTableId = Number(watch("table"));
  const selectedTable = tablesQuery.data?.results.find((table) => table.id === selectedTableId);
  const matchingMenuIds = new Set((menusQuery.data?.results || []).filter((menu) => menu.restuarant === selectedTable?.restaurant).map((menu) => menu.id));
  const visibleMenuItems = selectedTable ? menuItems.filter((item) => matchingMenuIds.has(item.menu)) : [];
  const total = useMemo(() => selectedItems.reduce((sum, selected) => {
    const item = menuItems.find((candidate) => candidate.id === selected.menu_item);
    return sum + Number(item?.price || 0) * selected.quantity;
  }, 0), [selectedItems, menuItems]);

  const addItem = (menuItem) => setSelectedItems((current) => {
    const existing = current.find((item) => item.menu_item === menuItem.id);
    return existing ? current.map((item) => item.menu_item === menuItem.id ? { ...item, quantity: item.quantity + 1 } : item) : [...current, { menu_item: menuItem.id, quantity: 1 }];
  });
  const changeQuantity = (id, amount) => setSelectedItems((current) => current.map((item) => item.menu_item === id ? { ...item, quantity: Math.max(1, item.quantity + amount) } : item));
  const removeItem = (id) => setSelectedItems((current) => current.filter((item) => item.menu_item !== id));
  const submit = (values) => onSubmit({ table: Number(values.table), note: values.note, items: selectedItems });

  return (
    <Modal open={open} onClose={onClose} title={order ? `Edit order #${order.id}` : "Create a new order"} description={order ? "Changing items sends the order back to pending." : "Choose a table, then add at least one item."} size="xl">
      {(tablesQuery.isLoading || menusQuery.isLoading || itemsQuery.isLoading) ? <LoadingState label="Loading tables and menu..." /> : <form onSubmit={handleSubmit(submit)} className="order-builder">
        <div className="order-builder__menu">
          <h3>Menu items</h3>
          <div className="menu-picker">
            {!selectedTable && <div className="menu-picker__empty">Choose a table to see its menu.</div>}
            {selectedTable && !visibleMenuItems.length && <div className="menu-picker__empty">This restaurant has no menu items yet.</div>}
            {visibleMenuItems.map((item) => <button type="button" key={item.id} onClick={() => addItem(item)} className="menu-picker__item">
              <div className="menu-picker__image">{item.image ? <img src={item.image} alt="" /> : <ShoppingBag size={20} />}</div>
              <span><strong>{item.name}</strong><small>{item.category}</small></span><b>{formatCurrency(item.price)}</b><Plus size={17} />
            </button>)}
          </div>
        </div>
        <div className="order-builder__summary">
          <FormField label="Table" error={errors.table?.message} required>
            <select disabled={Boolean(order)} {...register("table", { required: "Choose a table", onChange: () => setSelectedItems([]) })}><option value="">Select a table</option>{tablesQuery.data?.results.filter((table) => table.status !== "inactive").map((table) => <option key={table.id} value={table.id}>{table.restaurant_name} · Table {table.table_number} · {table.capacity} seats · {table.status_display}</option>)}</select>
          </FormField>
          <FormField label="Order note"><textarea rows="2" maxLength="300" placeholder="Allergies or special requests" {...register("note")} /></FormField>
          <div className="selected-items"><div className="selected-items__title"><h3>Order items</h3><span>{selectedItems.length}</span></div>
            {selectedItems.length ? selectedItems.map((selected) => {
              const item = menuItems.find((candidate) => candidate.id === selected.menu_item);
              return <div className="selected-item" key={selected.menu_item}><div><strong>{item?.name || `Item #${selected.menu_item}`}</strong><small>{formatCurrency(item?.price)}</small></div><div className="quantity-control"><button type="button" onClick={() => changeQuantity(selected.menu_item, -1)}><Minus size={14} /></button><span>{selected.quantity}</span><button type="button" onClick={() => changeQuantity(selected.menu_item, 1)}><Plus size={14} /></button></div><button type="button" className="remove-button" onClick={() => removeItem(selected.menu_item)}><Trash2 size={16} /></button></div>;
            }) : <div className="selected-items__empty">Choose items from the menu.</div>}
          </div>
          <div className="order-total"><span>Estimated total</span><strong>{formatCurrency(total)}</strong></div>
          <div className="modal-actions"><Button type="button" variant="ghost" onClick={onClose}>Cancel</Button><Button type="submit" loading={loading} disabled={!selectedItems.length}>{order ? "Save order" : "Create order"}</Button></div>
        </div>
      </form>}
    </Modal>
  );
}
