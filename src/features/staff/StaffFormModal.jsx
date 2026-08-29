import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Button } from "../../shared/components/Button";
import { FormField } from "../../shared/components/FormField";
import { Modal } from "../../shared/components/Modal";

export function StaffFormModal({ open, member, actorRole, restaurants, onClose, onSubmit, loading }) {
  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm();
  useEffect(() => { if (open) reset({ email: member?.email || "", password: "", first_name: member?.first_name || "", last_name: member?.last_name || "", role: member?.role || "waiter", restaurant: member?.restaurant || restaurants[0]?.id || "" }); }, [open, member, restaurants, reset]);
  const selectedRole = watch("role");
  const needsRestaurant = ["waiter", "chef"].includes(selectedRole);
  const submit = (values) => {
    const payload = { email: values.email, first_name: values.first_name, last_name: values.last_name, role: values.role, restaurant: needsRestaurant ? Number(values.restaurant) : null };
    if (!member) payload.password = values.password;
    onSubmit(payload);
  };
  const roles = actorRole === "platform_admin" ? [["waiter", "Waiter"], ["chef", "Chef"], ["owner", "Owner"], ["platform_admin", "Platform admin"]] : [["waiter", "Waiter"], ["chef", "Chef"]];
  return <Modal open={open} onClose={onClose} title={member ? "Edit team member" : "Add team member"} description={actorRole === "owner" ? "Owners can manage waiters and chefs assigned to their restaurants." : "Create an account and assign the correct level of access."}>
    <form className="form-grid" onSubmit={handleSubmit(submit)}>
      <FormField label="First name" required error={errors.first_name?.message}><input {...register("first_name", { required: "First name is required" })} /></FormField>
      <FormField label="Last name" required error={errors.last_name?.message}><input {...register("last_name", { required: "Last name is required" })} /></FormField>
      <FormField label="Email" required error={errors.email?.message} className="form-field--full"><input type="email" {...register("email", { required: "Email is required" })} /></FormField>
      {!member && <FormField label="Temporary password" required error={errors.password?.message} className="form-field--full" hint="The user can change it later in Settings."><input type="password" autoComplete="new-password" {...register("password", { required: "Password is required", minLength: { value: 8, message: "Use at least 8 characters" } })} /></FormField>}
      <FormField label="Role" required><select {...register("role")}>{roles.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></FormField>
      {needsRestaurant && <FormField label="Restaurant" required error={errors.restaurant?.message}><select {...register("restaurant", { required: "Restaurant is required" })}>{restaurants.map((restaurant) => <option key={restaurant.id} value={restaurant.id}>{restaurant.name}</option>)}</select></FormField>}
      <div className="modal-actions form-field--full"><Button type="button" variant="ghost" onClick={onClose}>Cancel</Button><Button type="submit" loading={loading}>{member ? "Save member" : "Create account"}</Button></div>
    </form>
  </Modal>;
}

