import { useState } from "react";
import { useForm } from "react-hook-form";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { ChefHat, ClipboardList, Eye, EyeOff, LockKeyhole, Mail, Table2, UtensilsCrossed } from "lucide-react";
import { Button } from "../../shared/components/Button";
import { FormField } from "../../shared/components/FormField";
import { getApiError } from "../../lib/apiClient";
import { useAuth } from "./AuthProvider";

export default function LoginPage() {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState("");
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    defaultValues: { email: "", password: "" },
  });

  if (isAuthenticated) return <Navigate to="/" replace />;

  const onSubmit = async (values) => {
    setServerError("");
    try {
      const user = await login(values);
      const fallback = user.role === "platform_admin" ? "/restaurants" : user.role === "chef" ? "/kitchen" : user.role === "waiter" ? "/orders" : "/dashboard";
      navigate(location.state?.from || fallback, { replace: true });
    } catch (error) {
      setServerError(getApiError(error, "Email or password is incorrect."));
    }
  };

  return (
    <main className="login-page login-page--single">
      <div className="login-decoration" aria-hidden="true">
        <span className="login-decoration__shape login-decoration__shape--one"><UtensilsCrossed /></span>
        <span className="login-decoration__shape login-decoration__shape--two"><Table2 /></span>
        <span className="login-decoration__shape login-decoration__shape--three"><ClipboardList /></span>
      </div>

      <section className="login-panel login-panel--single">
        <div className="login-shell">
          <div className="brand brand--large brand--login"><span className="brand__mark"><ChefHat /></span><span>Resto<strong>Hub</strong></span></div>
          <div className="login-card">
            <div className="login-card__heading"><span className="eyebrow">Welcome back</span><h2>Sign in</h2><p>Everything you need for today's service.</p></div>
            <form onSubmit={handleSubmit(onSubmit)} noValidate>
              {serverError && <div className="form-alert" role="alert">{serverError}</div>}
              <FormField label="Email address" error={errors.email?.message} required>
                <div className="input-with-icon"><Mail size={18} /><input type="email" autoComplete="email" placeholder="name@restaurant.com" {...register("email", { required: "Email is required", pattern: { value: /^\S+@\S+\.\S+$/, message: "Enter a valid email" } })} /></div>
              </FormField>
              <FormField label="Password" error={errors.password?.message} required>
                <div className="input-with-icon"><LockKeyhole size={18} /><input type={showPassword ? "text" : "password"} autoComplete="current-password" placeholder="Enter your password" {...register("password", { required: "Password is required" })} /><button type="button" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? "Hide password" : "Show password"}>{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button></div>
              </FormField>
              <Button type="submit" size="lg" loading={isSubmitting} className="login-submit">Sign in</Button>
            </form>
            <p className="login-card__help">Need help? Ask your manager.</p>
          </div>
          <div className="login-capabilities" aria-label="RestoHub features">
            <span><ClipboardList size={15} /> Orders</span>
            <span><Table2 size={15} /> Tables</span>
            <span><UtensilsCrossed size={15} /> Kitchen</span>
          </div>
        </div>
      </section>
    </main>
  );
}
