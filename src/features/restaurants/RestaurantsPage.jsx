import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowRight, Building2, Mail, MapPin, Pencil, Phone, Plus, Trash2, UserRound } from "lucide-react";
import { Link } from "react-router-dom";
import { apiClient, getApiError, getCollection } from "../../lib/apiClient";
import { Button } from "../../shared/components/Button";
import { ConfirmDialog } from "../../shared/components/ConfirmDialog";
import { PageHeader } from "../../shared/components/PageHeader";
import { EmptyState, ErrorState, LoadingState } from "../../shared/components/StateView";
import { useToast } from "../../shared/components/ToastProvider";
import { useAuth } from "../auth/AuthProvider";
import { RestaurantFormModal } from "./RestaurantFormModal";
import { restaurantWorkspacePath } from "./useRestaurantScope";

export default function RestaurantsPage() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const queryClient = useQueryClient();
  const [form, setForm] = useState({ open: false, restaurant: null });
  const [deleteRestaurant, setDeleteRestaurant] = useState(null);
  const isAdmin = user.role === "platform_admin";
  const restaurantsQuery = useQuery({ queryKey: ["restaurants"], queryFn: () => getCollection("/restaurants/", { limit: 100 }) });
  const ownersQuery = useQuery({ queryKey: ["owners", "options"], queryFn: () => getCollection("/users/", { role: "owner", limit: 100 }), enabled: isAdmin });
  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["restaurants"] });
    queryClient.invalidateQueries({ queryKey: ["dashboard"] });
  };
  const saveMutation = useMutation({
    mutationFn: ({ data, restaurant }) => restaurant
      ? apiClient.patch(`/restaurants/${restaurant.id}/`, data)
      : apiClient.post("/restaurants/", data),
    onSuccess: () => {
      invalidate();
      setForm({ open: false, restaurant: null });
      showToast(form.restaurant ? "Restaurant updated." : "Restaurant created.");
    },
    onError: (error) => showToast(getApiError(error), "error"),
  });
  const deleteMutation = useMutation({
    mutationFn: (restaurant) => apiClient.delete(`/restaurants/${restaurant.id}/`),
    onSuccess: () => { invalidate(); setDeleteRestaurant(null); showToast("Restaurant deleted."); },
    onError: (error) => showToast(getApiError(error), "error"),
  });

  return (
    <div className="page-stack restaurants-page">
      <PageHeader
        title={isAdmin ? "Choose a restaurant" : "Restaurants"}
        description={isAdmin ? "Open a restaurant to manage its daily work." : "Manage your restaurant locations."}
        actions={isAdmin && <Button onClick={() => setForm({ open: true, restaurant: null })}><Plus size={18} /> Create restaurant</Button>}
      />

      {restaurantsQuery.isLoading ? (
        <LoadingState label="Loading restaurants..." />
      ) : restaurantsQuery.isError ? (
        <ErrorState onRetry={restaurantsQuery.refetch} />
      ) : restaurantsQuery.data.results.length ? (
        <section className="restaurants-grid">
          {restaurantsQuery.data.results.map((restaurant) => (
            <article className="restaurant-card" key={restaurant.id}>
              <header>
                <div className="restaurant-card__icon"><Building2 /></div>
                <div className="row-actions">
                  <button onClick={() => setForm({ open: true, restaurant })} aria-label={`Edit ${restaurant.name}`}><Pencil size={17} /></button>
                  <button className="danger" onClick={() => setDeleteRestaurant(restaurant)} aria-label={`Delete ${restaurant.name}`}><Trash2 size={17} /></button>
                </div>
              </header>
              <h2>{restaurant.name}</h2>
              <p>{restaurant.description}</p>
              <div className="restaurant-card__details">
                <span><UserRound /> {restaurant.owner_email}</span>
                <span><MapPin /> {restaurant.address}</span>
                <span><Phone /> {restaurant.phone}</span>
                <span><Mail /> {restaurant.email}</span>
              </div>
              {isAdmin && (
                <Link className="restaurant-card__open" to={restaurantWorkspacePath(restaurant.id)}>
                  Open workspace <ArrowRight size={17} />
                </Link>
              )}
            </article>
          ))}
        </section>
      ) : (
        <EmptyState title="No restaurants found" message={isAdmin ? "Create an owner account, then create the first restaurant." : "No restaurant has been connected to this account."} />
      )}

      <RestaurantFormModal
        open={form.open}
        restaurant={form.restaurant}
        owners={ownersQuery.data?.results || []}
        isAdmin={isAdmin}
        loading={saveMutation.isPending}
        onClose={() => setForm({ open: false, restaurant: null })}
        onSubmit={(data) => saveMutation.mutate({ data, restaurant: form.restaurant })}
      />
      <ConfirmDialog
        open={Boolean(deleteRestaurant)}
        title={`Delete ${deleteRestaurant?.name}?`}
        message="This cascades to its menu, tables, and orders. Only continue if you are certain."
        loading={deleteMutation.isPending}
        onClose={() => setDeleteRestaurant(null)}
        onConfirm={() => deleteMutation.mutate(deleteRestaurant)}
      />
    </div>
  );
}
