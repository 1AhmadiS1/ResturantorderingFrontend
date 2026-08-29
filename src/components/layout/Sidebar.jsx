import { ChefHat, LogOut, X } from "lucide-react";
import { NavLink } from "react-router-dom";
import { ROLE_LABELS } from "../../config";
import { useAuth } from "../../features/auth/AuthProvider";
import { navigation } from "./navigation";

export function Sidebar({ open, onClose }) {
  const { user, logout } = useAuth();
  const visibleNavigation = navigation.filter((item) => item.roles.includes(user.role));
  const initials = `${user.first_name?.[0] || ""}${user.last_name?.[0] || ""}` || user.email[0];

  return (
    <>
      <div className={`sidebar-backdrop ${open ? "is-open" : ""}`} onClick={onClose} />
      <aside className={`sidebar ${open ? "is-open" : ""}`}>
        <div className="sidebar__top">
          <div className="brand"><span className="brand__mark"><ChefHat /></span><span>Resto<strong>Hub</strong></span></div>
          <button className="icon-button sidebar__close" onClick={onClose} aria-label="Close menu"><X size={21} /></button>
        </div>
        <nav className="sidebar__nav" aria-label="Main navigation">
          <span className="sidebar__label">Workspace</span>
          {visibleNavigation.map(({ label, to, icon: Icon }) => (
            <NavLink key={to} to={to} onClick={onClose} className={({ isActive }) => `nav-link ${isActive ? "is-active" : ""}`}>
              <Icon size={20} /><span>{label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="sidebar__profile">
          <div className="avatar">{initials.toUpperCase()}</div>
          <div><strong>{user.first_name || user.email.split("@")[0]}</strong><span>{ROLE_LABELS[user.role]}</span></div>
          <button className="icon-button" onClick={logout} title="Sign out" aria-label="Sign out"><LogOut size={18} /></button>
        </div>
      </aside>
    </>
  );
}

