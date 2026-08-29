import { useQuery } from "@tanstack/react-query";
import { ArrowRight, ChefHat, CircleDollarSign, ClipboardList, Table2, UtensilsCrossed, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../auth/AuthProvider";
import { getCollection } from "../../lib/apiClient";
import { formatCurrency, formatRelativeTime } from "../../shared/utils/formatters";
import { StatusBadge } from "../../shared/components/StatusBadge";
import { StatCard } from "../../shared/components/StatCard";
import { ErrorState, LoadingState } from "../../shared/components/StateView";

export default function DashboardPage() {
  const { user } = useAuth();
  const ordersQuery = useQuery({ queryKey: ["dashboard", "orders"], queryFn: () => getCollection("/orders/", { limit: 500, ordering: "-created_at" }) });
  const tablesQuery = useQuery({ queryKey: ["dashboard", "tables"], queryFn: () => getCollection("/tables/", { limit: 500 }) });
  const itemsQuery = useQuery({ queryKey: ["dashboard", "menuitems"], queryFn: () => getCollection("/menuitems/", { limit: 1 }) });
  const staffQuery = useQuery({ queryKey: ["dashboard", "staff"], queryFn: () => getCollection("/users/", { limit: 1 }), enabled: ["owner", "platform_admin"].includes(user.role) });

  if (ordersQuery.isLoading || tablesQuery.isLoading || itemsQuery.isLoading) return <LoadingState label="Preparing your dashboard..." />;
  if (ordersQuery.isError || tablesQuery.isError || itemsQuery.isError) return <ErrorState onRetry={() => { ordersQuery.refetch(); tablesQuery.refetch(); itemsQuery.refetch(); }} />;

  const orders = ordersQuery.data.results;
  const tables = tablesQuery.data.results;
  const activeOrders = orders.filter((order) => ["pending", "preparing", "ready"].includes(order.status));
  const completedRevenue = orders.filter((order) => order.status === "served").reduce((total, order) => total + Number(order.total_price), 0);
  const availableTables = tables.filter((table) => table.status === "available").length;
  const recentOrders = orders.slice(0, 6);
  const firstName = user.first_name || user.email.split("@")[0];

  return (
    <div className="page-stack">
      <div className="dashboard-welcome"><div><span className="eyebrow">Operations overview</span><h1>Welcome back, {firstName} <span aria-hidden="true">👋</span></h1><p>Here is what is happening across your visible restaurants.</p></div><div className="dashboard-welcome__date">{new Intl.DateTimeFormat("en", { weekday: "long", month: "long", day: "numeric" }).format(new Date())}</div></div>

      <section className="stats-grid">
        <StatCard icon={ClipboardList} label="Active orders" value={activeOrders.length} detail={`${ordersQuery.data.count} visible in total`} />
        <StatCard icon={CircleDollarSign} label="Served revenue" value={formatCurrency(completedRevenue)} detail="Across loaded served orders" tone="green" />
        <StatCard icon={Table2} label="Available tables" value={`${availableTables} / ${tablesQuery.data.count}`} detail={tables.length ? `${Math.round((availableTables / tables.length) * 100)}% ready` : "No tables yet"} tone="amber" />
        <StatCard icon={UtensilsCrossed} label="Menu items" value={itemsQuery.data.count} detail="Available to your team" tone="blue" />
      </section>

      <section className="dashboard-grid">
        <article className="panel panel--wide">
          <div className="panel__header"><div><h2>Recent orders</h2><p>Latest activity from your restaurants</p></div><Link className="text-link" to="/orders">View all <ArrowRight size={16} /></Link></div>
          {recentOrders.length ? <div className="recent-orders">
            {recentOrders.map((order) => <Link to="/orders" className="recent-order" key={order.id}>
              <strong>#{order.id}</strong><span>Table {order.table_number}</span><span className="recent-order__items">{order.items.length} item{order.items.length === 1 ? "" : "s"}</span><StatusBadge status={order.status} /><span>{formatRelativeTime(order.created_at)}</span><b>{formatCurrency(order.total_price)}</b>
            </Link>)}
          </div> : <div className="panel-empty">No orders have been placed yet.</div>}
        </article>

        <article className="panel">
          <div className="panel__header"><div><h2>Kitchen pulse</h2><p>Orders that need attention</p></div><ChefHat size={21} /></div>
          <div className="pulse-list">
            {["pending", "preparing", "ready"].map((status) => {
              const count = activeOrders.filter((order) => order.status === status).length;
              return <div key={status}><StatusBadge status={status} /><strong>{count}</strong></div>;
            })}
          </div>
          <Link to="/kitchen" className="button button--secondary button--md button--full">Open kitchen display <ArrowRight size={17} /></Link>
        </article>
      </section>

      <section className="panel quick-actions">
        <div className="panel__header"><div><h2>Quick actions</h2><p>Jump straight into the work</p></div></div>
        <div className="quick-actions__grid">
          <Link to="/orders?create=1"><ClipboardList /><span>New order</span></Link>
          <Link to="/menu"><UtensilsCrossed /><span>Manage menu</span></Link>
          <Link to="/tables"><Table2 /><span>Manage tables</span></Link>
          <Link to="/kitchen"><ChefHat /><span>Kitchen display</span></Link>
          <Link to="/staff"><Users /><span>{staffQuery.data?.count ?? 0} staff members</span></Link>
        </div>
      </section>
    </div>
  );
}

