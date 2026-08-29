import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Button } from "../../shared/components/Button";
import { FormField } from "../../shared/components/FormField";
import { Modal } from "../../shared/components/Modal";

export function RestaurantFormModal({ open, restaurant, owners, isAdmin, onClose, onSubmit, loading }) {
  const { register, handleSubmit, reset, formState: { errors } } = useForm();
  useEffect(() => { if (open) reset({ name: restaurant?.name || "", owner: restaurant?.owner || owners[0]?.id || "", address: restaurant?.address || "", phone: restaurant?.phone || "", email: restaurant?.email || "", description: restaurant?.description || "" }); }, [open, restaurant, owners, reset]);
  const submit = (values) => { const payload = { name: values.name, address: values.address, phone: values.phone, email: values.email, description: values.description }; if (isAdmin) payload.owner = Number(values.owner); onSubmit(payload); };
  return <Modal open={open} onClose={onClose} title={restaurant ? "Edit restaurant" : "Create restaurant"} description={restaurant ? "Update public restaurant details and contact information." : "Create the restaurant after its owner account exists."}>
    <form className="form-grid" onSubmit={handleSubmit(submit)}>
      <FormField label="Restaurant name" required error={errors.name?.message} className="form-field--full"><input {...register("name", { required: "Name is required" })} /></FormField>
      {isAdmin && <FormField label="Owner" required error={errors.owner?.message} className="form-field--full"><select {...register("owner", { required: "Owner is required" })}><option value="">Choose an owner</option>{owners.map((owner) => <option value={owner.id} key={owner.id}>{owner.first_name} {owner.last_name} · {owner.email}</option>)}</select></FormField>}
      <FormField label="Email" required error={errors.email?.message}><input type="email" {...register("email", { required: "Email is required" })} /></FormField>
      <FormField label="Phone" required error={errors.phone?.message}><input type="tel" {...register("phone", { required: "Phone is required" })} /></FormField>
      <FormField label="Address" required error={errors.address?.message} className="form-field--full"><input {...register("address", { required: "Address is required" })} /></FormField>
      <FormField label="Description" required error={errors.description?.message} className="form-field--full"><textarea rows="3" {...register("description", { required: "Description is required" })} /></FormField>
      <div className="modal-actions form-field--full"><Button type="button" variant="ghost" onClick={onClose}>Cancel</Button><Button type="submit" loading={loading}>{restaurant ? "Save restaurant" : "Create restaurant"}</Button></div>
    </form>
  </Modal>;
}

