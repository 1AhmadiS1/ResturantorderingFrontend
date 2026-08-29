import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ImageOff, Pencil, Plus, Trash2, UtensilsCrossed } from "lucide-react";
import { apiClient, getApiError, getCollection } from "../../lib/apiClient";
import { Button } from "../../shared/components/Button";
import { ConfirmDialog } from "../../shared/components/ConfirmDialog";
import { PageHeader } from "../../shared/components/PageHeader";
import { SearchField } from "../../shared/components/SearchField";
import { EmptyState, ErrorState, LoadingState } from "../../shared/components/StateView";
import { useToast } from "../../shared/components/ToastProvider";
import { formatCurrency } from "../../shared/utils/formatters";
import { useAuth } from "../auth/AuthProvider";
import { MenuFormModal } from "./MenuFormModal";
import { MenuItemFormModal } from "./MenuItemFormModal";

export default function MenuPage() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [itemModal, setItemModal] = useState({ open: false, item: null });
  const [menuModal, setMenuModal] = useState({ open: false, menu: null });
  const [deleteItem, setDeleteItem] = useState(null);
  const canManage = ["owner", "platform_admin"].includes(user.role);
  const menusQuery = useQuery({ queryKey: ["menus"], queryFn: () => getCollection("/menu/", { limit: 100 }) });
  const itemsQuery = useQuery({ queryKey: ["menuitems"], queryFn: () => getCollection("/menuitems/", { limit: 500, ordering: "name" }) });
  const restaurantsQuery = useQuery({ queryKey: ["restaurants", "options"], queryFn: () => getCollection("/restaurants/", { limit: 100 }), enabled: canManage });
  const invalidate = () => { queryClient.invalidateQueries({ queryKey: ["menus"] }); queryClient.invalidateQueries({ queryKey: ["menuitems"] }); };
  const itemMutation = useMutation({ mutationFn: ({ data, item }) => item ? apiClient.patch(`/menuitems/${item.id}/`, data) : apiClient.post("/menuitems/", data), onSuccess: () => { invalidate(); setItemModal({ open: false, item: null }); showToast(itemModal.item ? "Menu item updated." : "Menu item added."); }, onError: (error) => showToast(getApiError(error), "error") });
  const menuMutation = useMutation({ mutationFn: ({ data, menu }) => menu ? apiClient.patch(`/menu/${menu.id}/`, data) : apiClient.post("/menu/", data), onSuccess: () => { invalidate(); setMenuModal({ open: false, menu: null }); showToast(menuModal.menu ? "Menu updated." : "Menu created."); }, onError: (error) => showToast(getApiError(error), "error") });
  const deleteMutation = useMutation({ mutationFn: (item) => apiClient.delete(`/menuitems/${item.id}/`), onSuccess: () => { invalidate(); setDeleteItem(null); showToast("Menu item deleted."); }, onError: (error) => showToast(getApiError(error), "error") });

  const items = itemsQuery.data?.results || [];
  const categories = [...new Set(items.map((item) => item.category))].sort();
  const visibleItems = useMemo(() => items.filter((item) => (!category || item.category === category) && (!search || `${item.name} ${item.description} ${item.category}`.toLowerCase().includes(search.toLowerCase()))), [items, search, category]);

  if (menusQuery.isLoading || itemsQuery.isLoading) return <LoadingState label="Loading the menu..." />;
  if (menusQuery.isError || itemsQuery.isError) return <ErrorState onRetry={() => { menusQuery.refetch(); itemsQuery.refetch(); }} />;

  return <div className="page-stack">
    <PageHeader eyebrow="Food & drinks" title="Menu" description={canManage ? "Keep the menu accurate and easy for your service team to scan." : "Browse the items available at your restaurant."} actions={canManage && <div className="button-group"><Button variant="secondary" onClick={() => setMenuModal({ open: true, menu: menusQuery.data.results[0] || null })}>{menusQuery.data.count ? <><Pencil size={17} /> Edit menu</> : <><Plus size={17} /> Create menu</>}</Button><Button disabled={!menusQuery.data.count} onClick={() => setItemModal({ open: true, item: null })}><Plus size={18} /> Add item</Button></div>} />
    <div className="toolbar"><SearchField value={search} onChange={setSearch} placeholder="Search menu items..." /><select value={category} onChange={(event) => setCategory(event.target.value)}><option value="">All categories</option>{categories.map((value) => <option value={value} key={value}>{value}</option>)}</select></div>
    {menusQuery.data.results.length > 1 && <div className="menu-contexts">{menusQuery.data.results.map((menu) => <span key={menu.id}><UtensilsCrossed size={15} /> {menu.name} · {menu.restaurant_name}</span>)}</div>}
    {visibleItems.length ? <section className="menu-grid">{visibleItems.map((item) => <article className="menu-card" key={item.id}><div className="menu-card__image">{item.image ? <img src={item.image} alt={item.name} /> : <ImageOff size={28} />}{canManage && <div className="menu-card__actions"><button onClick={() => setItemModal({ open: true, item })} title="Edit"><Pencil size={17} /></button><button onClick={() => setDeleteItem(item)} title="Delete"><Trash2 size={17} /></button></div>}</div><div className="menu-card__content"><div><span>{item.category}</span><strong>{formatCurrency(item.price)}</strong></div><h2>{item.name}</h2><p>{item.description}</p><small>{item.restaurant_name}</small></div></article>)}</section> : <EmptyState title="No menu items found" message={search || category ? "Try changing your search or category." : canManage ? "Add your first menu item to get started." : "The restaurant has not added menu items yet."} />}
    <MenuItemFormModal open={itemModal.open} item={itemModal.item} menus={menusQuery.data.results} loading={itemMutation.isPending} onClose={() => setItemModal({ open: false, item: null })} onSubmit={(data) => itemMutation.mutate({ data, item: itemModal.item })} />
    <MenuFormModal open={menuModal.open} menu={menuModal.menu} restaurants={restaurantsQuery.data?.results || []} loading={menuMutation.isPending} onClose={() => setMenuModal({ open: false, menu: null })} onSubmit={(data) => menuMutation.mutate({ data, menu: menuModal.menu })} />
    <ConfirmDialog open={Boolean(deleteItem)} title={`Delete ${deleteItem?.name}?`} message="This removes the item from the menu. Existing order history may still reference it." loading={deleteMutation.isPending} onClose={() => setDeleteItem(null)} onConfirm={() => deleteMutation.mutate(deleteItem)} />
  </div>;
}
