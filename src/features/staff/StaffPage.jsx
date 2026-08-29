import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { KeyRound, Pencil, Plus, Trash2 } from "lucide-react";
import { apiClient, getApiError, getCollection } from "../../lib/apiClient";
import { Button } from "../../shared/components/Button";
import { ConfirmDialog } from "../../shared/components/ConfirmDialog";
import { PageHeader } from "../../shared/components/PageHeader";
import { Pagination } from "../../shared/components/Pagination";
import { SearchField } from "../../shared/components/SearchField";
import { EmptyState, ErrorState, LoadingState } from "../../shared/components/StateView";
import { useToast } from "../../shared/components/ToastProvider";
import { useDebouncedValue } from "../../shared/hooks/useDebouncedValue";
import { titleCase } from "../../shared/utils/formatters";
import { useAuth } from "../auth/AuthProvider";
import { ResetPasswordModal } from "./ResetPasswordModal";
import { StaffFormModal } from "./StaffFormModal";

const PAGE_SIZE = 10;

export default function StaffPage() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("");
  const [offset, setOffset] = useState(0);
  const [form, setForm] = useState({ open: false, member: null });
  const [deleteMember, setDeleteMember] = useState(null);
  const [resetMember, setResetMember] = useState(null);
  const [resetPasswordError, setResetPasswordError] = useState("");
  const debouncedSearch = useDebouncedValue(search);

  useEffect(() => setOffset(0), [debouncedSearch, role]);

  const staffQuery = useQuery({
    queryKey: ["staff", { search: debouncedSearch, role, offset }],
    queryFn: () => getCollection("/users/", {
      search: debouncedSearch || undefined,
      role: role || undefined,
      limit: PAGE_SIZE,
      offset,
    }),
  });

  const restaurantsQuery = useQuery({
    queryKey: ["restaurants", "options"],
    queryFn: () => getCollection("/restaurants/", { limit: 100 }),
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["staff"] });
    queryClient.invalidateQueries({ queryKey: ["dashboard"] });
  };

  const saveMutation = useMutation({
    mutationFn: ({ data, member }) => (
      member ? apiClient.patch(`/users/${member.id}/`, data) : apiClient.post("/users/", data)
    ),
    onSuccess: () => {
      invalidate();
      setForm({ open: false, member: null });
      showToast(form.member ? "Team member updated." : "Team member created.");
    },
    onError: (error) => showToast(getApiError(error), "error"),
  });

  const deleteMutation = useMutation({
    mutationFn: (member) => apiClient.delete(`/users/${member.id}/`),
    onSuccess: () => {
      invalidate();
      setDeleteMember(null);
      showToast("Team member removed.");
    },
    onError: (error) => showToast(getApiError(error), "error"),
  });

  const resetPasswordMutation = useMutation({
    mutationFn: ({ member, data }) => apiClient.post(`/users/${member.id}/reset-password/`, data),
    onSuccess: () => {
      setResetMember(null);
      setResetPasswordError("");
      showToast("Password reset successfully.");
    },
    onError: (error) => setResetPasswordError(getApiError(error)),
  });

  const openResetPassword = (member) => {
    resetPasswordMutation.reset();
    setResetPasswordError("");
    setResetMember(member);
  };

  const closeResetPassword = () => {
    resetPasswordMutation.reset();
    setResetPasswordError("");
    setResetMember(null);
  };

  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="People & access"
        title="Staff"
        description="Create accounts and give each person only the access their work requires."
        actions={<Button onClick={() => setForm({ open: true, member: null })}><Plus size={18} /> Add member</Button>}
      />

      <div className="toolbar">
        <SearchField value={search} onChange={setSearch} placeholder="Search name or email..." />
        <select value={role} onChange={(event) => setRole(event.target.value)}>
          <option value="">All roles</option>
          <option value="waiter">Waiters</option>
          <option value="chef">Chefs</option>
          {user.role === "platform_admin" && (
            <>
              <option value="owner">Owners</option>
              <option value="platform_admin">Platform admins</option>
            </>
          )}
        </select>
      </div>

      <section className="panel panel--flush">
        {staffQuery.isLoading ? (
          <LoadingState label="Loading staff..." />
        ) : staffQuery.isError ? (
          <ErrorState onRetry={staffQuery.refetch} />
        ) : staffQuery.data.results.length ? (
          <>
            <div className="staff-list">
              {staffQuery.data.results.map((member) => (
                <article key={member.id} className="staff-row">
                  <div className="avatar">
                    {`${member.first_name?.[0] || ""}${member.last_name?.[0] || ""}`.toUpperCase() || member.email[0].toUpperCase()}
                  </div>
                  <div className="staff-row__identity">
                    <strong>{member.first_name} {member.last_name}</strong>
                    <span>{member.email}</span>
                  </div>
                  <span className={`role-chip role-chip--${member.role}`}>{titleCase(member.role)}</span>
                  <span className="staff-row__restaurant">{member.restaurant_name || "Platform access"}</span>
                  <div className="row-actions">
                    <button
                      onClick={() => openResetPassword(member)}
                      title="Reset password"
                      aria-label={`Reset password for ${member.email}`}
                    >
                      <KeyRound size={17} />
                    </button>
                    <button
                      onClick={() => setForm({ open: true, member })}
                      title="Edit user"
                      aria-label={`Edit ${member.email}`}
                    >
                      <Pencil size={17} />
                    </button>
                    <button
                      className="danger"
                      onClick={() => setDeleteMember(member)}
                      title="Remove user"
                      aria-label={`Remove ${member.email}`}
                    >
                      <Trash2 size={17} />
                    </button>
                  </div>
                </article>
              ))}
            </div>
            <Pagination count={staffQuery.data.count} offset={offset} limit={PAGE_SIZE} onChange={setOffset} />
          </>
        ) : (
          <EmptyState
            title="No team members found"
            message={search || role ? "Try changing the search or role filter." : "Add the first member of your restaurant team."}
          />
        )}
      </section>

      <StaffFormModal
        open={form.open}
        member={form.member}
        actorRole={user.role}
        restaurants={restaurantsQuery.data?.results || []}
        loading={saveMutation.isPending}
        onClose={() => setForm({ open: false, member: null })}
        onSubmit={(data) => saveMutation.mutate({ data, member: form.member })}
      />

      <ResetPasswordModal
        open={Boolean(resetMember)}
        member={resetMember}
        loading={resetPasswordMutation.isPending}
        error={resetPasswordError}
        onClose={closeResetPassword}
        onSubmit={(data) => {
          if (resetMember) resetPasswordMutation.mutate({ member: resetMember, data });
        }}
      />

      <ConfirmDialog
        open={Boolean(deleteMember)}
        title={`Remove ${deleteMember?.first_name || "this user"}?`}
        message="The account will no longer be able to sign in."
        confirmLabel="Remove account"
        loading={deleteMutation.isPending}
        onClose={() => setDeleteMember(null)}
        onConfirm={() => deleteMutation.mutate(deleteMember)}
      />
    </div>
  );
}
