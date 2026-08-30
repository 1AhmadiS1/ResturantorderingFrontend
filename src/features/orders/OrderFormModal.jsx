import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { MessageSquarePlus, Minus, Plus, Search, ShoppingBag, Trash2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { getCollection } from "../../lib/apiClient";
import { Button } from "../../shared/components/Button";
import { FormField } from "../../shared/components/FormField";
import { Modal } from "../../shared/components/Modal";
import { LoadingState } from "../../shared/components/StateView";
import { formatCurrency } from "../../shared/utils/formatters";

export function OrderFormModal({ open, order, restaurantId, onClose, onSubmit, loading }) {
  const [selectedItems, setSelectedItems] = useState([]);
  const [menuSearch, setMenuSearch] = useState("");
  const [category, setCategory] = useState("");
  const [noteOpen, setNoteOpen] = useState(false);
  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm();
  const tablesQuery = useQuery({ queryKey: ["order-form", "tables", restaurantId], queryFn: () => getCollection("/tables/", { limit: 500, restaurant: restaurantId || undefined }), enabled: open });
  const menusQuery = useQuery({ queryKey: ["order-form", "menus", restaurantId], queryFn: () => getCollection("/menu/", { limit: 100, restuarant: restaurantId || undefined }), enabled: open });
  const scopedMenuId = menusQuery.data?.results?.[0]?.id;
  const itemsQuery = useQuery({
    queryKey: ["order-form", "items", restaurantId, scopedMenuId],
    queryFn: () => getCollection("/menuitems/", { limit: 500, ordering: "name", menu: restaurantId ? scopedMenuId : undefined }),
    enabled: open && (!restaurantId || Boolean(scopedMenuId)),
  });

  useEffect(() => {
    if (!open) return;
    reset({ table: order?.table || "", note: order?.note || "" });
    setSelectedItems(order?.items?.map((item) => ({ menu_item: item.menu_item, quantity: item.quantity })) || []);
    setMenuSearch("");
    setCategory("");
    setNoteOpen(Boolean(order?.note));
  }, [open, order, reset]);

  const menuItems = useMemo(() => itemsQuery.data?.results || [], [itemsQuery.data]);
  const selectedTableId = Number(watch("table"));
  const selectedTable = tablesQuery.data?.results.find((table) => table.id === selectedTableId);
  const restaurantItems = useMemo(() => {
    if (!selectedTable) return [];
    const matchingMenuIds = new Set((menusQuery.data?.results || [])
      .filter((menu) => menu.restuarant === selectedTable.restaurant)
      .map((menu) => menu.id));
    return menuItems.filter((item) => matchingMenuIds.has(item.menu));
  }, [menuItems, menusQuery.data, selectedTable]);
  const categories = useMemo(
    () => [...new Set(restaurantItems.map((item) => item.category).filter(Boolean))].sort(),
    [restaurantItems],
  );
  const visibleMenuItems = restaurantItems.filter((item) => (
    (!category || item.category === category)
    && (!menuSearch || `${item.name} ${item.category || ""}`.toLowerCase().includes(menuSearch.toLowerCase()))
  ));
  const total = useMemo(() => selectedItems.reduce((sum, selected) => {
    const item = menuItems.find((candidate) => candidate.id === selected.menu_item);
    return sum + Number(item?.price || 0) * selected.quantity;
  }, 0), [selectedItems, menuItems]);
  const totalQuantity = selectedItems.reduce((sum, item) => sum + item.quantity, 0);

  const addItem = (menuItem) => setSelectedItems((current) => {
    const existing = current.find((item) => item.menu_item === menuItem.id);
    return existing
      ? current.map((item) => item.menu_item === menuItem.id ? { ...item, quantity: item.quantity + 1 } : item)
      : [...current, { menu_item: menuItem.id, quantity: 1 }];
  });
  const changeQuantity = (id, amount) => setSelectedItems((current) => current.map((item) => (
    item.menu_item === id ? { ...item, quantity: Math.max(1, item.quantity + amount) } : item
  )));
  const removeItem = (id) => setSelectedItems((current) => current.filter((item) => item.menu_item !== id));
  const submit = (values) => onSubmit({ table: Number(values.table), note: values.note, items: selectedItems });

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={order ? `Edit order #${order.id}` : "New order"}
      description={order ? "Saving changes returns this order to New." : "Pick a table, add dishes, then send it."}
      size="xl"
    >
      {(tablesQuery.isLoading || menusQuery.isLoading || itemsQuery.isLoading) ? (
        <LoadingState label="Loading tables and menu..." />
      ) : (
        <form onSubmit={handleSubmit(submit)} className="order-builder">
          <div className="order-flow" aria-label="Order steps">
            <span className={selectedTable ? "is-complete" : "is-current"}><b>1</b> Table</span>
            <i />
            <span className={selectedItems.length ? "is-complete" : selectedTable ? "is-current" : ""}><b>2</b> Dishes</span>
            <i />
            <span className={selectedItems.length ? "is-current" : ""}><b>3</b> Review</span>
          </div>

          <div className="order-builder__table">
            <FormField label="Choose a table" error={errors.table?.message} required>
              <select
                disabled={Boolean(order)}
                {...register("table", {
                  required: "Choose a table",
                  onChange: () => {
                    setSelectedItems([]);
                    setCategory("");
                    setMenuSearch("");
                  },
                })}
              >
                <option value="">Select table</option>
                {tablesQuery.data?.results
                  .filter((table) => table.status !== "inactive")
                  .map((table) => (
                    <option key={table.id} value={table.id}>
                      {table.restaurant_name} — Table {table.table_number} — {table.capacity} seats
                    </option>
                  ))}
              </select>
            </FormField>
          </div>

          <div className="order-builder__layout">
            <section className="order-builder__menu">
              <div className="order-builder__section-heading">
                <div><span>Step 2</span><h3>Choose dishes</h3></div>
                {selectedTable && <small>Tap a dish to add it</small>}
              </div>

              {selectedTable && restaurantItems.length > 0 && (
                <>
                  <label className="order-menu-search">
                    <Search size={17} />
                    <input value={menuSearch} onChange={(event) => setMenuSearch(event.target.value)} placeholder="Find a dish" />
                  </label>
                  <div className="order-category-tabs">
                    <button type="button" className={!category ? "is-active" : ""} onClick={() => setCategory("")}>All</button>
                    {categories.map((value) => (
                      <button type="button" key={value} className={category === value ? "is-active" : ""} onClick={() => setCategory(value)}>{value}</button>
                    ))}
                  </div>
                </>
              )}

              <div className="menu-picker">
                {!selectedTable && <div className="menu-picker__empty"><ShoppingBag size={25} /><span>Choose a table first</span></div>}
                {selectedTable && !restaurantItems.length && <div className="menu-picker__empty"><ShoppingBag size={25} /><span>No dishes in this menu yet</span></div>}
                {selectedTable && restaurantItems.length > 0 && !visibleMenuItems.length && <div className="menu-picker__empty"><Search size={24} /><span>No matching dishes</span></div>}
                {visibleMenuItems.map((item) => {
                  const quantity = selectedItems.find((selected) => selected.menu_item === item.id)?.quantity || 0;
                  return (
                    <button type="button" key={item.id} onClick={() => addItem(item)} className={`menu-picker__item ${quantity ? "is-selected" : ""}`}>
                      <div className="menu-picker__image">{item.image ? <img src={item.image} alt="" /> : <ShoppingBag size={22} />}</div>
                      <span><strong>{item.name}</strong><small>{item.category}</small></span>
                      <b>{formatCurrency(item.price)}</b>
                      <span className="menu-picker__add">{quantity ? quantity : <Plus size={17} />}</span>
                    </button>
                  );
                })}
              </div>
            </section>

            <aside className="order-builder__summary">
              <div className="order-builder__section-heading">
                <div><span>Step 3</span><h3>Your order</h3></div>
                <strong>{totalQuantity} item{totalQuantity === 1 ? "" : "s"}</strong>
              </div>

              <div className="selected-items">
                {selectedItems.length ? selectedItems.map((selected) => {
                  const item = menuItems.find((candidate) => candidate.id === selected.menu_item);
                  return (
                    <div className="selected-item" key={selected.menu_item}>
                      <div><strong>{item?.name || `Item #${selected.menu_item}`}</strong><small>{formatCurrency(Number(item?.price || 0) * selected.quantity)}</small></div>
                      <div className="quantity-control">
                        <button type="button" onClick={() => changeQuantity(selected.menu_item, -1)} aria-label={`Remove one ${item?.name || "item"}`}><Minus size={14} /></button>
                        <span>{selected.quantity}</span>
                        <button type="button" onClick={() => changeQuantity(selected.menu_item, 1)} aria-label={`Add one ${item?.name || "item"}`}><Plus size={14} /></button>
                      </div>
                      <button type="button" className="remove-button" onClick={() => removeItem(selected.menu_item)} aria-label={`Remove ${item?.name || "item"}`}><Trash2 size={16} /></button>
                    </div>
                  );
                }) : <div className="selected-items__empty">Your order is empty</div>}
              </div>

              <button type="button" className="order-note-toggle" onClick={() => setNoteOpen((value) => !value)}>
                <MessageSquarePlus size={17} /> {noteOpen ? "Hide note" : "Add a note"}
              </button>
              {noteOpen && (
                <FormField label="Kitchen note">
                  <textarea rows="2" maxLength="300" placeholder="Allergy or special request" {...register("note")} />
                </FormField>
              )}

              <div className="order-total"><span>Total</span><strong>{formatCurrency(total)}</strong></div>
              <div className="modal-actions order-builder__actions">
                <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
                <Button type="submit" loading={loading} disabled={!selectedItems.length}>
                  {order ? "Save & return to New" : "Send to kitchen"}
                </Button>
              </div>
            </aside>
          </div>
        </form>
      )}
    </Modal>
  );
}
