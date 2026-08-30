import { useState } from "react";
import { KeyRound, Mail, ShieldCheck, Store, UserRound } from "lucide-react";
import { ROLE_LABELS } from "../../config";
import { PageHeader } from "../../shared/components/PageHeader";
import { useAuth } from "../auth/AuthProvider";
import { ChangePasswordModal } from "./ChangePasswordModal";

export default function SettingsPage() {
  const { user } = useAuth();
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);

  return (
    <div className="page-stack settings-page">
      <PageHeader
        title="Settings"
        description="Your account and password."
        actions={(
          <button
            className="icon-button icon-button--accent"
            onClick={() => setChangePasswordOpen(true)}
            title="Change password"
            data-tooltip="Change password"
            aria-label="Change password"
          >
            <KeyRound size={19} />
          </button>
        )}
      />

      <div className="settings-grid settings-grid--single">
        <section className="panel profile-panel">
          <div className="profile-panel__hero">
            <div className="avatar avatar--large">
              {`${user.first_name?.[0] || ""}${user.last_name?.[0] || ""}`.toUpperCase() || user.email[0].toUpperCase()}
            </div>
            <div>
              <h2>{user.first_name} {user.last_name}</h2>
              <span>{ROLE_LABELS[user.role]}</span>
            </div>
          </div>
          <div className="profile-details">
            <div><Mail /><span>Email<strong>{user.email}</strong></span></div>
            <div><ShieldCheck /><span>Access level<strong>{ROLE_LABELS[user.role]}</strong></span></div>
            <div><Store /><span>Restaurant<strong>{user.restaurant_name || "Not assigned"}</strong></span></div>
          </div>
          <p className="profile-panel__note">
            <UserRound size={17} /> Ask an owner or platform administrator if your name, role, or restaurant assignment needs to change.
          </p>
        </section>
      </div>

      <ChangePasswordModal open={changePasswordOpen} onClose={() => setChangePasswordOpen(false)} />
    </div>
  );
}
