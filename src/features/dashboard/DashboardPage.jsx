import { useQuery } from "@tanstack/react-query";
import {
  ArrowRight,
  ChefHat,
  CircleDollarSign,
  ClipboardList,
  Table2,
  UtensilsCrossed,
  Users,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../auth/AuthProvider";
import { getCollection } from "../../lib/apiClient";
import { formatCurrency, formatRelativeTime } from "../../shared/utils/formatters";
import { StatusBadge } from "../../shared/components/StatusBadge";
import { StatCard } from "../../shared/components/StatCard";
import { ErrorState, LoadingState } from "../../shared/components/StateView";
import { restaurantWorkspacePath, useRestaurantScope } from "../restaurants/useRestaurantScope";

export default function DashboardPage() {
  const { user } = useAuth();
  const { restaurantId, restaurant } = useRestaurantScope();
  const pathFor = (path) => restaurantWorkspacePath(restaurantId, path);
  const ordersQuery = useQuery({
    queryKey: ["dashboard", "orders", restaurantId],
    queryFn: () => getCollection("/orders/", { limit: 500, ordering: "-created_at", restuarant: restaurantId || undefined }),
  });
  const tablesQuery = useQuery({
    queryKey: ["dashboard", "tables", restaurantId],
    queryFn: () => getCollection("/tables/", { limit: 500, restaurant: restaurantId || undefined }),
  });
  const menusQuery = useQuery({
    queryKey: ["dashboard", "menus", restaurantId],
    queryFn: () => getCollection("/menu/", { limit: 100, restuarant: restaurantId || undefined }),
    enabled: Boolean(restaurantId),
  });
  const scopedMenuId = menusQuery.data?.results?.[0]?.id;
  const itemsQuery = useQuery({
    queryKey: ["dashboard", "menuitems", restaurantId, scopedMenuId],
    queryFn: () => getCollection("/menuitems/", { limit: 8, menu: restaurantId ? scopedMenuId : undefined }),
    enabled: !restaurantId || Boolean(scopedMenuId),
  });
  const staffQuery = useQuery({
    queryKey: ["dashboard", "staff", restaurantId],
    queryFn: () => getCollection("/users/", { limit: 1, restaurant: restaurantId || undefined }),
    enabled: ["owner", "platform_admin"].includes(user.role),
  });

  if (ordersQuery.isLoading || tablesQuery.isLoading || menusQuery.isLoading || itemsQuery.isLoading) {
    return <LoadingState label="Preparing your dashboard..." />;
  }

  if (ordersQuery.isError || tablesQuery.isError || menusQuery.isError || itemsQuery.isError) {
    return (
      <ErrorState
        onRetry={() => {
          ordersQuery.refetch();
          tablesQuery.refetch();
          menusQuery.refetch();
          itemsQuery.refetch();
        }}
      />
    );
  }

  const orders = ordersQuery.data.results;
  const tables = tablesQuery.data.results;
  const menuItems = itemsQuery.data?.results || [];
  const activeOrders = orders.filter((order) => ["pending", "preparing", "ready"].includes(order.status));
  const completedRevenue = orders.filter((order) => order.status === "served").reduce((total, order) => total + Number(order.total_price), 0);
  const availableTables = tables.filter((table) => table.status === "available").length;
  const recentOrders = orders.slice(0, 6);
  const menuHighlights = menuItems.slice(0, 5);
  const mainHighlight = menuHighlights[0];
  const secondaryHighlights = menuHighlights.slice(1);
  const firstName = user.first_name || user.email.split("@")[0];

  return (
    <div className="page-stack">
      <div className="dashboard-welcome">
        <div>
          <span className="eyebrow">Today</span>
          <h1>{restaurant?.name || `Hi, ${firstName}`}</h1>
          <p>{restaurant ? "Today's restaurant activity." : "Your restaurant at a glance."}</p>
        </div>
        <div className="dashboard-welcome__date">
          {new Intl.DateTimeFormat("en", {
            weekday: "long",
            month: "long",
            day: "numeric",
          }).format(new Date())}
        </div>
      </div>

      <section className="stats-grid">
        <StatCard icon={ClipboardList} label="Active orders" value={activeOrders.length} detail={`${ordersQuery.data.count} total`} />
        <StatCard icon={CircleDollarSign} label="Sales" value={formatCurrency(completedRevenue)} detail="Served orders" tone="green" />
        <StatCard icon={Table2} label="Tables ready" value={`${availableTables} / ${tablesQuery.data.count}`} detail={tables.length ? `${Math.round((availableTables / tables.length) * 100)}% available` : "No tables"} tone="amber" />
        <StatCard icon={UtensilsCrossed} label="Menu items" value={itemsQuery.data?.count || 0} detail="On the menu" tone="blue" />
      </section>

      {mainHighlight && (
        <section className="menu-showcase">
          <Link to={pathFor("/menu")} className="menu-showcase__hero">
            <div className="menu-showcase__image">
              {mainHighlight.image ? (
                <img src={mainHighlight.image} alt={mainHighlight.name} />
              ) : (
                <UtensilsCrossed size={42} aria-hidden="true" />
              )}
            </div>
            <div className="menu-showcase__overlay" />
            <div className="menu-showcase__copy">
              <span>Menu pick</span>
              <strong>{mainHighlight.name}</strong>
              <small>{formatCurrency(mainHighlight.price)}</small>
            </div>
          </Link>

          <div className="menu-showcase__grid">
            {secondaryHighlights.map((item) => (
              <Link to={pathFor("/menu")} className="menu-showcase__card" key={item.id}>
                <div className="menu-showcase__thumb">
                  {item.image ? (
                    <img src={item.image} alt={item.name} />
                  ) : (
                    <UtensilsCrossed size={25} aria-hidden="true" />
                  )}
                </div>
                <div>
                  <strong>{item.name}</strong>
                  <span>{item.category || formatCurrency(item.price)}</span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="dashboard-grid">
        <article className="panel panel--wide">
          <div className="panel__header">
            <div>
              <h2>Recent orders</h2>
              <p>Newest first</p>
            </div>
            <Link className="text-link" to={pathFor("/orders")}>
              View all <ArrowRight size={16} />
            </Link>
          </div>
          {recentOrders.length ? (
            <div className="recent-orders">
              {recentOrders.map((order) => (
                <Link to={pathFor("/orders")} className="recent-order" key={order.id}>
                  <strong>#{order.id}</strong>
                  <span>Table {order.table_number}</span>
                  <span className="recent-order__items">
                    {order.items.length} item{order.items.length === 1 ? "" : "s"}
                  </span>
                  <StatusBadge status={order.status} />
                  <span>{formatRelativeTime(order.created_at)}</span>
                  <b>{formatCurrency(order.total_price)}</b>
                </Link>
              ))}
            </div>
          ) : (
            <div className="panel-empty">No orders have been placed yet.</div>
          )}
        </article>

        <article className="panel">
          <div className="panel__header">
            <div>
              <h2>Kitchen pulse</h2>
              <p>Needs attention</p>
            </div>
            <ChefHat size={21} />
          </div>
          <div className="pulse-list">
            {["pending", "preparing", "ready"].map((status) => {
              const count = activeOrders.filter((order) => order.status === status).length;
              return (
                <div key={status}>
                  <StatusBadge status={status} />
                  <strong>{count}</strong>
                </div>
              );
            })}
          </div>
          <Link to={pathFor("/kitchen")} className="button button--secondary button--md button--full">
            Open kitchen display <ArrowRight size={17} />
          </Link>
        </article>
      </section>

      <section className="panel quick-actions">
        <div className="panel__header">
          <div>
            <h2>Quick actions</h2>
            <p>Your common tasks</p>
          </div>
        </div>
        <div className="quick-actions__grid">
          <Link to={`${pathFor("/orders")}?create=1`}><ClipboardList /><span>New order</span></Link>
          <Link to={pathFor("/menu")}><UtensilsCrossed /><span>Manage menu</span></Link>
          <Link to={pathFor("/tables")}><Table2 /><span>Manage tables</span></Link>
          <Link to={pathFor("/kitchen")}><ChefHat /><span>Kitchen display</span></Link>
          <Link to={pathFor("/staff")}><Users /><span>{staffQuery.data?.count ?? 0} staff members</span></Link>
        </div>
      </section>
    </div>
  );
}
