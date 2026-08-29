import { useEffect, useState } from "react";
import { KeyRound } from "lucide-react";
import { useForm } from "react-hook-form";
import { Button } from "../../shared/components/Button";
import { FormField } from "../../shared/components/FormField";
import { Modal } from "../../shared/components/Modal";

export function ResetPasswordModal({ open, member, loading, error, onClose, onSubmit }) {
  const [showPassword, setShowPassword] = useState(false);
  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm({
    defaultValues: { new_password: "", confirm_password: "" },
  });

  useEffect(() => {
    if (open) reset({ new_password: "", confirm_password: "" });
  }, [open, reset, member]);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Reset password"
      description={`Set a new password for ${member?.first_name || "this user"}.`}
      size="sm"
    >
      <form className="modal-form" onSubmit={handleSubmit(onSubmit)}>
        {error && <div className="form-alert" role="alert">{error}</div>}
        <FormField label="New password" required error={errors.new_password?.message}>
          <input
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            {...register("new_password", {
              required: "New password is required",
              minLength: { value: 8, message: "Use at least 8 characters" },
            })}
          />
        </FormField>
        <FormField label="Confirm password" required error={errors.confirm_password?.message}>
          <input
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            {...register("confirm_password", {
              required: "Confirm the password",
              validate: (value) => value === watch("new_password") || "Passwords do not match",
            })}
          />
        </FormField>
        <label className="checkbox-row">
          <input type="checkbox" checked={showPassword} onChange={(event) => setShowPassword(event.target.checked)} />
          <span>Show password</span>
        </label>
        <div className="modal-actions">
          <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
          <Button type="submit" loading={loading}><KeyRound size={17} /> Reset password</Button>
        </div>
      </form>
    </Modal>
  );
}
