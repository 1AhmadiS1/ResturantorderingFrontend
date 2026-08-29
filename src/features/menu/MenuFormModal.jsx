import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Button } from "../../shared/components/Button";
import { FormField } from "../../shared/components/FormField";
import { Modal } from "../../shared/components/Modal";

export function MenuFormModal({ open, menu, restaurants, onClose, onSubmit, loading }) {
  const { register, handleSubmit, reset, formState: { errors } } = useForm();
  useEffect(() => { if (open) reset({ name: menu?.name || "", description: menu?.description || "", restuarant: menu?.restuarant || restaurants[0]?.id || "" }); }, [open, menu, restaurants, reset]);
  return <Modal open={open} onClose={onClose} title={menu ? "Edit menu" : "Create menu"} description="Each restaurant can have one menu.">
    <form className="form-grid" onSubmit={handleSubmit((values) => onSubmit({ ...values, restuarant: Number(values.restuarant) }))}>
      <FormField label="Menu name" required error={errors.name?.message} className="form-field--full"><input {...register("name", { required: "Name is required" })} /></FormField>
      <FormField label="Restaurant" required error={errors.restuarant?.message} className="form-field--full"><select disabled={Boolean(menu)} {...register("restuarant", { required: "Restaurant is required" })}>{restaurants.map((restaurant) => <option value={restaurant.id} key={restaurant.id}>{restaurant.name}</option>)}</select></FormField>
      <FormField label="Description" className="form-field--full"><textarea rows="3" {...register("description")} /></FormField>
      <div className="modal-actions form-field--full"><Button type="button" variant="ghost" onClick={onClose}>Cancel</Button><Button type="submit" loading={loading}>{menu ? "Save menu" : "Create menu"}</Button></div>
    </form>
  </Modal>;
}

