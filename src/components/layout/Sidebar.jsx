import { ArrowLeft, ChefHat, LogOut, X } from "lucide-react";
import { Link, NavLink } from "react-router-dom";
import { ROLE_LABELS } from "../../config";
import { useAuth } from "../../features/auth/AuthProvider";
import { restaurantWorkspacePath, useRestaurantScope } from "../../features/restaurants/useRestaurantScope";
import { navigation } from "./navigation";

export function Sidebar({ open, onClose }) {
  const { user, logout } = useAuth();
  const { restaurantId, restaurant, isRestaurantWorkspace } = useRestaurantScope();
  const roleNavigation = navigation.filter((item) => item.roles.includes(user.role));
  const visibleNavigation = user.role === "platform_admin"
    ? roleNavigation.filter((item) => isRestaurantWorkspace
      ? item.restaurantScoped || item.to === "/settings"
      : ["/restaurants", "/settings"].includes(item.to))
    : roleNavigation;
  const initials = `${user.first_name?.[0] || ""}${user.last_name?.[0] || ""}` || user.email[0];

  return (
    <>
      <div className={`sidebar-backdrop fixed inset-0 z-40 bg-[#2d151c]/55 backdrop-blur-sm transition-opacity duration-200 min-[981px]:hidden ${open ? "is-open visible opacity-100" : "invisible opacity-0"}`} onClick={onClose} />
      <aside className={`sidebar fixed inset-y-0 left-0 z-50 flex w-[min(86vw,300px)] flex-col overflow-hidden bg-[radial-gradient(circle_at_18%_0%,rgba(239,91,78,.3),transparent_18rem),linear-gradient(180deg,#44232d_0%,#351c25_100%)] px-4 pb-4 pt-5 text-white shadow-2xl transition-transform duration-200 min-[981px]:w-[244px] min-[981px]:translate-x-0 min-[981px]:shadow-none ${open ? "is-open translate-x-0" : "-translate-x-full"}`}>
        <div className="sidebar__top flex items-center justify-between px-2 pb-5">
          <div className="brand flex items-center gap-2.5 text-xl font-extrabold tracking-[-0.04em] text-white"><span className="brand__mark grid size-10 place-items-center rounded-xl bg-[#fff1eb] text-brand-700 shadow-lg"><ChefHat size={24} /></span><span>Resto<strong className="text-[#ff8a7f]">Hub</strong></span></div>
          <button className="icon-button sidebar__close grid size-10 place-items-center rounded-xl border border-white/15 bg-white/10 text-white hover:bg-white/15 min-[981px]:hidden" onClick={onClose} aria-label="Close menu"><X size={21} /></button>
        </div>
        {isRestaurantWorkspace && (
          <Link className="workspace-switcher mb-3 flex items-center gap-2.5 rounded-xl border border-white/10 bg-white/[0.07] p-3 text-white/80 transition hover:bg-white/12 hover:text-white" to="/restaurants" onClick={onClose}>
            <ArrowLeft size={17} />
            <span className="flex min-w-0 flex-col"><small className="text-[0.62rem] text-white/50">All restaurants</small><strong className="truncate text-xs">{restaurant?.name || `Restaurant ${restaurantId}`}</strong></span>
          </Link>
        )}
        <nav className="sidebar__nav flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto pr-0.5" aria-label="Main navigation">
          <span className="sidebar__label px-3 pb-2 pt-2.5 text-[0.65rem] font-extrabold uppercase tracking-[0.12em] text-white/45">{isRestaurantWorkspace ? "Restaurant" : "Workspace"}</span>
          {visibleNavigation.map(({ label, to, icon: Icon, restaurantScoped }) => (
            <NavLink key={to} to={restaurantWorkspacePath(isRestaurantWorkspace && restaurantScoped ? restaurantId : null, to)} onClick={onClose} className={({ isActive }) => `nav-link flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition ${isActive ? "is-active bg-white text-brand-700 shadow-sm" : "text-white/70 hover:bg-white/10 hover:text-white"}`}>
              <Icon size={20} /><span>{label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="sidebar__profile mt-4 grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2.5 rounded-xl border border-white/10 bg-white/[0.08] p-2.5">
          <div className="avatar grid size-9 place-items-center rounded-xl bg-brand-500 text-xs font-extrabold text-white">{initials.toUpperCase()}</div>
          <div className="flex min-w-0 flex-col"><strong className="truncate text-xs text-white">{user.first_name || user.email.split("@")[0]}</strong><span className="truncate text-[0.65rem] text-white/60">{ROLE_LABELS[user.role]}</span></div>
          <button className="icon-button grid size-8 place-items-center rounded-lg border-0 bg-transparent text-white/70 hover:bg-white/10 hover:text-white" onClick={logout} title="Sign out" aria-label="Sign out"><LogOut size={18} /></button>
        </div>
      </aside>
    </>
  );
}
