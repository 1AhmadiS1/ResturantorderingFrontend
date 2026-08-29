import { useState } from "react";
import { useForm } from "react-hook-form";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { ChefHat, Eye, EyeOff, LockKeyhole, Mail } from "lucide-react";
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
      const fallback = user.role === "chef" ? "/kitchen" : user.role === "waiter" ? "/orders" : "/dashboard";
      navigate(location.state?.from || fallback, { replace: true });
    } catch (error) {
      setServerError(getApiError(error, "Email or password is incorrect."));
    }
  };

  return (
    <main className="login-page">
      <section className="login-visual" aria-hidden="true">
        <div className="login-visual__glow" />
        <div className="brand brand--large"><span className="brand__mark"><ChefHat /></span><span>Resto<strong>Hub</strong></span></div>
        <div className="login-visual__copy">
          <span className="eyebrow">Restaurant operations, simplified</span>
          <h1>Keep every table, ticket, and team member in sync.</h1>
          <p>A focused workspace for owners, waiters, and kitchen staff—without the clutter.</p>
        </div>
        <div className="login-visual__preview">
          <div><span>12</span><small>Active orders</small></div>
          <div><span>08</span><small>Tables ready</small></div>
          <div><span>4m</span><small>Average prep</small></div>
        </div>
      </section>

      <section className="login-panel">
        <div className="login-card">
          <div className="brand brand--mobile"><span className="brand__mark"><ChefHat /></span><span>Resto<strong>Hub</strong></span></div>
          <div className="login-card__heading"><span className="eyebrow">Welcome back</span><h2>Sign in to your workspace</h2><p>Use the account provided by your restaurant administrator.</p></div>
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
          <p className="login-card__help">Having trouble signing in? Ask your owner or platform administrator to verify your account.</p>
        </div>
      </section>
    </main>
  );
}

