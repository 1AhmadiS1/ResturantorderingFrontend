import { LogOut, Menu, UserRound } from "lucide-react";
import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ROLE_LABELS } from "../../config";
import { useAuth } from "../../features/auth/AuthProvider";
import { restaurantWorkspacePath, useRestaurantScope } from "../../features/restaurants/useRestaurantScope";
import { navigation } from "./navigation";

export function Header({ onOpenMenu }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [profileOpen, setProfileOpen] = useState(false);
  const { restaurantId, restaurant, isRestaurantWorkspace } = useRestaurantScope();
  const current = navigation.find((item) => {
    const itemPath = restaurantWorkspacePath(isRestaurantWorkspace && item.restaurantScoped ? restaurantId : null, item.to);
    return location.pathname === itemPath || location.pathname.startsWith(`${itemPath}/`);
  });

  return (
    <header className="topbar sticky top-0 z-30 flex h-[58px] items-center justify-between gap-2 border-b border-[#eadbd6]/80 bg-white/90 px-3 backdrop-blur-xl sm:h-[68px] sm:px-5 min-[981px]:px-[clamp(21px,3vw,42px)]">
      <div className="topbar__title flex min-w-0 flex-1 items-center gap-2.5 sm:gap-3">
        <button className="icon-button topbar__menu grid size-10 shrink-0 place-items-center rounded-xl border border-[#eadbd6] bg-white text-[#6f5d60] transition hover:bg-brand-50 min-[981px]:hidden" onClick={onOpenMenu} aria-label="Open menu"><Menu size={22} /></button>
        <div className="flex min-w-0 flex-1 flex-col">
          <span className="truncate text-[0.64rem] text-[#9a8c8f] sm:text-[0.7rem]">{restaurant?.name || "RestoHub workspace"}</span>
          <strong className="truncate text-[0.86rem] text-[#342326] sm:text-[0.94rem]">{current?.label || "Overview"}</strong>
        </div>
      </div>
      <div className="profile-menu relative shrink-0">
        <button className="profile-menu__trigger flex items-center gap-2 rounded-xl border border-transparent p-1 transition hover:border-[#eadbd6] hover:bg-white sm:pr-2" onClick={() => setProfileOpen((value) => !value)} aria-expanded={profileOpen}>
          <div className="avatar avatar--small grid size-9 place-items-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 text-sm font-extrabold text-white shadow-sm">{(user.first_name?.[0] || user.email[0]).toUpperCase()}</div>
          <div className="hidden min-w-0 flex-col text-left sm:flex"><strong className="max-w-36 truncate text-xs text-[#3f2d31]">{user.first_name || user.email}</strong><span className="text-[0.65rem] text-[#8f7f82]">{ROLE_LABELS[user.role]}</span></div>
        </button>
        {profileOpen && <div className="profile-menu__popover absolute right-0 top-[calc(100%+8px)] z-50 grid w-48 overflow-hidden rounded-xl border border-[#eadbd6] bg-white p-1.5 shadow-[0_18px_45px_rgba(91,49,42,.16)]">
          <button className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-xs font-semibold text-[#5f4c50] hover:bg-brand-50 hover:text-brand-700" onClick={() => { navigate("/settings"); setProfileOpen(false); }}><UserRound size={17} />Account settings</button>
          <button className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-xs font-semibold text-[#a33430] hover:bg-red-50" onClick={logout}><LogOut size={17} />Sign out</button>
        </div>}
      </div>
    </header>
  );
}
