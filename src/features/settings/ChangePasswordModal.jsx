import { useEffect, useState } from "react";
import { KeyRound } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { apiClient, getApiError } from "../../lib/apiClient";
import { Button } from "../../shared/components/Button";
import { FormField } from "../../shared/components/FormField";
import { Modal } from "../../shared/components/Modal";
import { PasswordStrengthMeter } from "../../shared/components/PasswordStrengthMeter";
import { useToast } from "../../shared/components/ToastProvider";

export function ChangePasswordModal({ open, onClose }) {
  const { showToast } = useToast();
  const [passwordError, setPasswordError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm({
    defaultValues: { old_password: "", new_password: "", confirm_password: "" },
  });
  const newPassword = watch("new_password") || "";

  useEffect(() => {
    if (open) {
      reset({ old_password: "", new_password: "", confirm_password: "" });
      setPasswordError("");
      setShowPassword(false);
    }
  }, [open, reset]);

  const mutation = useMutation({
    mutationFn: (data) => apiClient.put("/change-password/", data),
    onSuccess: () => {
      reset();
      setPasswordError("");
      showToast("Password changed successfully. Sign in with the new password next time.");
      onClose();
    },
    onError: (error) => setPasswordError(getApiError(error)),
  });

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Change password"
      description="Use your current password before setting a new one."
      size="sm"
    >
      <form
        className="modal-form"
        onSubmit={handleSubmit(({ old_password, new_password }) => {
          setPasswordError("");
          mutation.mutate({ old_password, new_password });
        })}
      >
        {passwordError && <div className="form-alert" role="alert">{passwordError}</div>}
        <FormField label="Current password" required error={errors.old_password?.message}>
          <input
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            {...register("old_password", { required: "Current password is required" })}
          />
        </FormField>
        <FormField label="New password" required error={errors.new_password?.message}>
          <input
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            {...register("new_password", {
              required: "New password is required",
              minLength: { value: 8, message: "Use at least 8 characters" },
            })}
          />
          <PasswordStrengthMeter password={newPassword} />
        </FormField>
        <FormField label="Confirm new password" required error={errors.confirm_password?.message}>
          <input
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            {...register("confirm_password", {
              required: "Confirm your password",
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
          <Button type="submit" loading={mutation.isPending}><KeyRound size={17} /> Update password</Button>
        </div>
      </form>
    </Modal>
  );
}
