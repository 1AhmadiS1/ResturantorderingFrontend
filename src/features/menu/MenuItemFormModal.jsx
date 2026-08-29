import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Button } from "../../shared/components/Button";
import { FormField } from "../../shared/components/FormField";
import { Modal } from "../../shared/components/Modal";

export function MenuItemFormModal({ open, item, menus, onClose, onSubmit, loading }) {
  const { register, handleSubmit, reset, formState: { errors } } = useForm();
  useEffect(() => { if (open) reset({ name: item?.name || "", category: item?.category || "", price: item?.price || "", description: item?.description || "", menu: item?.menu || menus[0]?.id || "" }); }, [open, item, menus, reset]);
  const submit = (values) => {
    const formData = new FormData();
    formData.append("name", values.name);
    formData.append("category", values.category);
    formData.append("price", values.price);
    formData.append("description", values.description);
    formData.append("menu", values.menu);
    if (values.image?.[0]) formData.append("image", values.image[0]);
    onSubmit(formData);
  };
  return <Modal open={open} onClose={onClose} title={item ? "Edit menu item" : "Add menu item"} description="Keep names and categories short so they are easy to scan during service.">
    <form className="form-grid" onSubmit={handleSubmit(submit)}>
      <FormField label="Item name" required error={errors.name?.message}><input {...register("name", { required: "Name is required" })} /></FormField>
      <FormField label="Category" required error={errors.category?.message}><input placeholder="Main, Drinks, Dessert..." {...register("category", { required: "Category is required" })} /></FormField>
      <FormField label="Price" required error={errors.price?.message}><input type="number" min="0.01" step="0.01" {...register("price", { required: "Price is required", min: { value: 0.01, message: "Price must be greater than zero" } })} /></FormField>
      <FormField label="Menu" required error={errors.menu?.message}><select {...register("menu", { required: "Menu is required" })}>{menus.map((menu) => <option value={menu.id} key={menu.id}>{menu.name} · {menu.restaurant_name}</option>)}</select></FormField>
      <FormField label="Description" required error={errors.description?.message} className="form-field--full"><textarea rows="3" {...register("description", { required: "Description is required" })} /></FormField>
      <FormField label={item ? "Replace image (optional)" : "Image (optional)"} hint="JPEG, PNG or WebP; keep the file below 10 MB." className="form-field--full"><input type="file" accept="image/png,image/jpeg,image/webp" {...register("image")} /></FormField>
      <div className="modal-actions form-field--full"><Button type="button" variant="ghost" onClick={onClose}>Cancel</Button><Button type="submit" loading={loading}>{item ? "Save changes" : "Add item"}</Button></div>
    </form>
  </Modal>;
}

