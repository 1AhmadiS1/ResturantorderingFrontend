import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Button } from "../../shared/components/Button";
import { FormField } from "../../shared/components/FormField";
import { Modal } from "../../shared/components/Modal";

export function TableFormModal({ open, table, restaurants, onClose, onSubmit, loading }) {
  const { register, handleSubmit, reset, formState: { errors } } = useForm();
  useEffect(() => { if (open) reset({ restaurant: table?.restaurant || restaurants[0]?.id || "", table_number: table?.table_number || "", capacity: table?.capacity || 4, status: table?.status || "available" }); }, [open, table, restaurants, reset]);
  const submit = (values) => onSubmit({ ...values, restaurant: Number(values.restaurant), table_number: Number(values.table_number), capacity: Number(values.capacity) });
  return <Modal open={open} onClose={onClose} title={table ? `Edit table ${table.table_number}` : "Add a table"} description="Table numbers must be unique inside each restaurant.">
    <form className="form-grid" onSubmit={handleSubmit(submit)}>
      <FormField label="Restaurant" required error={errors.restaurant?.message} className="form-field--full"><select disabled={Boolean(table)} {...register("restaurant", { required: "Restaurant is required" })}>{restaurants.map((restaurant) => <option key={restaurant.id} value={restaurant.id}>{restaurant.name}</option>)}</select></FormField>
      <FormField label="Table number" required error={errors.table_number?.message}><input type="number" min="1" {...register("table_number", { required: "Table number is required", min: { value: 1, message: "Minimum is 1" } })} /></FormField>
      <FormField label="Capacity" required error={errors.capacity?.message}><input type="number" min="1" {...register("capacity", { required: "Capacity is required", min: { value: 1, message: "Minimum is 1" } })} /></FormField>
      <FormField label="Status" required className="form-field--full"><select {...register("status")}><option value="available">Available</option><option value="occupied">Occupied</option><option value="reserved">Reserved</option><option value="inactive">Inactive</option></select></FormField>
      <div className="modal-actions form-field--full"><Button type="button" variant="ghost" onClick={onClose}>Cancel</Button><Button type="submit" loading={loading}>{table ? "Save table" : "Add table"}</Button></div>
    </form>
  </Modal>;
}

