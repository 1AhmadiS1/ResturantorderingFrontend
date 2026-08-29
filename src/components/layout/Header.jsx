import { LogOut, Menu, UserRound } from "lucide-react";
import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ROLE_LABELS } from "../../config";
import { useAuth } from "../../features/auth/AuthProvider";
import { navigation } from "./navigation";

export function Header({ onOpenMenu }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [profileOpen, setProfileOpen] = useState(false);
  const current = navigation.find((item) => location.pathname.startsWith(item.to));

  return (
    <header className="topbar">
      <div className="topbar__title">
        <button className="icon-button topbar__menu" onClick={onOpenMenu} aria-label="Open menu"><Menu size={22} /></button>
        <div><span>RestoHub workspace</span><strong>{current?.label || "Overview"}</strong></div>
      </div>
      <div className="profile-menu">
        <button className="profile-menu__trigger" onClick={() => setProfileOpen((value) => !value)} aria-expanded={profileOpen}>
          <div className="avatar avatar--small">{(user.first_name?.[0] || user.email[0]).toUpperCase()}</div>
          <div><strong>{user.first_name || user.email}</strong><span>{ROLE_LABELS[user.role]}</span></div>
        </button>
        {profileOpen && <div className="profile-menu__popover">
          <button onClick={() => { navigate("/settings"); setProfileOpen(false); }}><UserRound size={17} />Account settings</button>
          <button onClick={logout}><LogOut size={17} />Sign out</button>
        </div>}
      </div>
    </header>
  );
}

