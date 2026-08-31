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
    <div className="page-stack flex min-w-0 max-w-full flex-col gap-3.5 overflow-x-hidden sm:gap-5">
      <div className="dashboard-welcome flex flex-col items-start justify-between gap-2 sm:flex-row sm:items-end sm:gap-5">
        <div>
          <span className="eyebrow text-[0.64rem] font-extrabold uppercase tracking-[0.1em] text-brand-600">Today</span>
          <h1 className="mb-1 mt-1 text-[1.65rem] font-extrabold leading-tight tracking-[-0.035em] text-[#342326] sm:text-[clamp(1.9rem,3vw,2.7rem)]">{restaurant?.name || `Hi, ${firstName}`}</h1>
          <p className="m-0 text-[0.82rem] text-[#74676a] sm:text-base">{restaurant ? "Today's restaurant activity." : "Your restaurant at a glance."}</p>
        </div>
        <div className="dashboard-welcome__date hidden rounded-lg border border-[#eadbd6] bg-white px-3 py-2 text-xs text-[#725b5f] sm:block">
          {new Intl.DateTimeFormat("en", {
            weekday: "long",
            month: "long",
            day: "numeric",
          }).format(new Date())}
        </div>
      </div>

      <section className="stats-grid grid grid-cols-2 gap-2 sm:gap-3 lg:grid-cols-4">
        <StatCard icon={ClipboardList} label="Active orders" value={activeOrders.length} detail={`${ordersQuery.data.count} total`} />
        <StatCard icon={CircleDollarSign} label="Sales" value={formatCurrency(completedRevenue)} detail="Served orders" tone="green" />
        <StatCard icon={Table2} label="Tables ready" value={`${availableTables} / ${tablesQuery.data.count}`} detail={tables.length ? `${Math.round((availableTables / tables.length) * 100)}% available` : "No tables"} tone="amber" />
        <StatCard icon={UtensilsCrossed} label="Menu items" value={itemsQuery.data?.count || 0} detail="On the menu" tone="blue" />
      </section>

      {mainHighlight && (
        <section className="menu-showcase grid min-w-0 max-w-full grid-cols-1 gap-2.5 overflow-hidden lg:grid-cols-[minmax(280px,1.618fr)_minmax(320px,1fr)] lg:gap-4">
          <Link to={pathFor("/menu")} className="menu-showcase__hero relative isolate flex min-h-[154px] min-w-0 max-w-full items-end overflow-hidden rounded-xl border border-[#eadbd6] bg-white p-3.5 shadow-[0_12px_32px_rgba(91,49,42,.08)] transition hover:border-brand-300 sm:min-h-[210px] sm:p-5">
            <div className="menu-showcase__image absolute inset-0 -z-20 grid place-items-center overflow-hidden bg-brand-100 text-brand-600">
              {mainHighlight.image ? (
                <img className="h-full w-full max-w-full object-cover saturate-[1.12]" src={mainHighlight.image} alt={mainHighlight.name} />
              ) : (
                <UtensilsCrossed size={42} aria-hidden="true" />
              )}
            </div>
            <div className="menu-showcase__overlay absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgba(58,27,32,.9),rgba(58,27,32,.32),transparent),linear-gradient(0deg,rgba(232,75,66,.2),transparent_58%)]" />
            <div className="menu-showcase__copy flex max-w-[82%] flex-col gap-1.5 text-white sm:max-w-xs">
              <span className="text-[0.6rem] font-black uppercase tracking-[0.1em] text-[#ffd59e] sm:text-[0.7rem]">Menu pick</span>
              <strong className="text-xl leading-tight font-extrabold tracking-[-0.035em] sm:text-[clamp(1.55rem,3vw,2.2rem)]">{mainHighlight.name}</strong>
              <small className="font-extrabold text-white">{formatCurrency(mainHighlight.price)}</small>
            </div>
          </Link>

          <div className="menu-showcase__grid flex w-full max-w-full snap-x gap-2 overflow-x-auto overscroll-x-contain pb-1 lg:grid lg:grid-cols-2 lg:overflow-visible lg:pb-0">
            {secondaryHighlights.map((item) => (
              <Link to={pathFor("/menu")} className="menu-showcase__card grid min-h-[74px] min-w-[min(232px,calc(100vw-48px))] max-w-[calc(100vw-48px)] snap-start grid-cols-[62px_minmax(0,1fr)] items-center gap-2.5 overflow-hidden rounded-xl border border-[#eadbd6] bg-white p-2 shadow-[0_12px_32px_rgba(91,49,42,.08)] transition hover:border-brand-300 lg:min-h-[110px] lg:min-w-0 lg:max-w-none lg:grid-cols-[92px_1fr]" key={item.id}>
                <div className="menu-showcase__thumb grid size-[62px] place-items-center overflow-hidden rounded-lg bg-brand-100 text-brand-600 lg:size-[92px] lg:rounded-xl">
                  {item.image ? (
                    <img className="h-full w-full max-w-full object-cover saturate-[1.12]" src={item.image} alt={item.name} />
                  ) : (
                    <UtensilsCrossed size={25} aria-hidden="true" />
                  )}
                </div>
                <div className="min-w-0">
                  <strong className="line-clamp-2 text-xs leading-tight text-[#3e2d30] lg:text-sm">{item.name}</strong>
                  <span className="mt-1 block text-[0.58rem] font-extrabold uppercase tracking-wide text-brand-700 lg:text-[0.68rem]">{item.category || formatCurrency(item.price)}</span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="dashboard-grid grid min-w-0 max-w-full grid-cols-1 gap-3 lg:grid-cols-[minmax(0,1.618fr)_minmax(280px,1fr)] lg:gap-4">
        <article className="panel panel--wide overflow-hidden rounded-xl border border-[#eadbd6] bg-white p-3.5 shadow-[0_12px_36px_rgba(91,49,42,.07)] sm:p-5">
          <div className="panel__header mb-3 flex items-center justify-between gap-3 sm:mb-4">
            <div>
              <h2 className="m-0 text-base font-extrabold text-[#2f2325]">Recent orders</h2>
              <p className="m-0 text-[0.7rem] text-[#74676a] sm:text-xs">Newest first</p>
            </div>
            <Link className="text-link inline-flex items-center gap-1 text-xs font-bold text-brand-700 hover:text-brand-500" to={pathFor("/orders")}>
              View all <ArrowRight size={16} />
            </Link>
          </div>
          {recentOrders.length ? (
            <div className="recent-orders -mx-3.5 -mb-3.5 sm:-mx-5 sm:-mb-5">
              {recentOrders.map((order) => (
                <Link to={pathFor("/orders")} className="recent-order grid min-h-[72px] grid-cols-[minmax(0,1fr)_auto] items-center gap-x-2.5 gap-y-1 border-t border-[#f2e7e3] px-3.5 py-3 text-xs transition hover:bg-brand-50 lg:min-h-[61px] lg:grid-cols-[65px_90px_80px_105px_1fr_80px] lg:gap-2.5 lg:px-5 lg:py-2.5 lg:text-[0.79rem]" key={order.id}>
                  <strong className="col-start-1 row-start-1 text-brand-700 lg:col-auto lg:row-auto">#{order.id}</strong>
                  <span className="col-start-1 row-start-2 text-[#6e5d60] lg:col-auto lg:row-auto">Table {order.table_number}</span>
                  <span className="recent-order__items hidden text-[#6e5d60] lg:block">
                    {order.items.length} item{order.items.length === 1 ? "" : "s"}
                  </span>
                  <span className="col-start-2 row-start-2 justify-self-end lg:col-auto lg:row-auto lg:justify-self-auto"><StatusBadge status={order.status} /></span>
                  <span className="hidden text-[#6e5d60] lg:block">{formatRelativeTime(order.created_at)}</span>
                  <b className="col-start-2 row-start-1 text-right text-sm text-[#352629] lg:col-auto lg:row-auto">{formatCurrency(order.total_price)}</b>
                </Link>
              ))}
            </div>
          ) : (
            <div className="panel-empty px-4 py-9 text-center text-sm text-[#74676a]">No orders have been placed yet.</div>
          )}
        </article>

        <article className="panel rounded-xl border border-[#eadbd6] bg-white p-3.5 shadow-[0_12px_36px_rgba(91,49,42,.07)] sm:p-5">
          <div className="panel__header mb-3 flex items-center justify-between gap-3 sm:mb-4">
            <div>
              <h2 className="m-0 text-base font-extrabold text-[#2f2325]">Kitchen pulse</h2>
              <p className="m-0 text-[0.7rem] text-[#74676a] sm:text-xs">Needs attention</p>
            </div>
            <ChefHat className="text-brand-500" size={21} />
          </div>
          <div className="pulse-list mb-4 grid gap-2">
            {["pending", "preparing", "ready"].map((status) => {
              const count = activeOrders.filter((order) => order.status === status).length;
              return (
                <div className="flex items-center justify-between rounded-lg bg-[#fffaf7] px-3 py-2" key={status}>
                  <StatusBadge status={status} />
                  <strong className="text-sm tabular-nums text-[#352629]">{count}</strong>
                </div>
              );
            })}
          </div>
          <Link to={pathFor("/kitchen")} className="button button--secondary button--md button--full inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg border border-[#eadbd6] bg-white px-4 py-2.5 text-sm font-bold text-[#5a3b3e] transition hover:border-brand-200 hover:bg-brand-50 hover:text-brand-700">
            Open kitchen display <ArrowRight size={17} />
          </Link>
        </article>
      </section>

      <section className="panel quick-actions rounded-xl border border-[#eadbd6] bg-white p-3.5 shadow-[0_12px_36px_rgba(91,49,42,.07)] sm:p-5">
        <div className="panel__header mb-3 flex items-center justify-between gap-3 sm:mb-4">
          <div>
            <h2 className="m-0 text-base font-extrabold text-[#2f2325]">Quick actions</h2>
            <p className="m-0 text-[0.7rem] text-[#74676a] sm:text-xs">Your common tasks</p>
          </div>
        </div>
        <div className="quick-actions__grid grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5 lg:gap-2.5 [&_a]:flex [&_a]:min-h-[72px] [&_a]:flex-col [&_a]:items-center [&_a]:justify-center [&_a]:gap-1.5 [&_a]:rounded-xl [&_a]:border [&_a]:border-[#eadbd6] [&_a]:bg-[#fffaf7] [&_a]:p-2 [&_a]:text-center [&_a]:text-xs [&_a]:font-semibold [&_a]:text-[#4d383c] [&_a]:transition [&_a:hover]:border-brand-300 [&_a:hover]:bg-brand-50 [&_a:hover]:text-brand-700 [&_svg]:size-5 [&_svg]:text-brand-500 sm:[&_a]:min-h-[86px] lg:[&_a]:min-h-[100px]">
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
