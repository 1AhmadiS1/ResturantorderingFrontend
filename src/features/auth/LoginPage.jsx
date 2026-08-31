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
    <main className="login-page login-page--single relative isolate grid h-dvh w-full box-border place-items-center overflow-hidden bg-[radial-gradient(circle_at_18%_18%,rgba(255,190,112,.34),transparent_25rem),radial-gradient(circle_at_82%_82%,rgba(232,75,66,.2),transparent_27rem),linear-gradient(145deg,#fffaf6,#fff1ea)] px-4 py-4 sm:px-5 sm:py-5">
      <div className="login-decoration" aria-hidden="true">
        <span className="login-decoration__shape login-decoration__shape--one"><UtensilsCrossed /></span>
        <span className="login-decoration__shape login-decoration__shape--two"><Table2 /></span>
        <span className="login-decoration__shape login-decoration__shape--three"><ClipboardList /></span>
      </div>

      <section className="login-panel login-panel--single flex h-full min-h-0 w-full max-w-full box-border items-center justify-center bg-transparent p-0">
        <div className="login-shell grid w-full max-w-[420px] box-border justify-items-stretch overflow-visible sm:max-w-[450px]">
          <div className="brand brand--large brand--login mx-auto mb-3 flex items-center gap-2.5 text-xl font-extrabold tracking-[-0.04em] text-[#3b282c] sm:mb-4 sm:text-2xl"><span className="brand__mark brand__mark--jump grid size-11 place-items-center rounded-[13px] bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-lg sm:size-12"><ChefHat /></span><span>Resto<strong className="text-brand-500">Hub</strong></span></div>
          <div className="login-card box-border w-full max-w-full rounded-[18px] border border-[#e5d2cb]/90 bg-white/95 p-5 shadow-[0_18px_45px_rgba(101,54,46,.12)] backdrop-blur-xl sm:rounded-2xl sm:p-7 sm:shadow-[0_24px_58px_rgba(101,54,46,.13)]">
            <div className="login-card__heading mb-4 text-center"><span className="eyebrow text-[0.62rem] font-extrabold uppercase tracking-[0.1em] text-brand-600 sm:text-[0.66rem] sm:tracking-[0.12em]">Welcome back</span><h2 className="mb-1.5 mt-1.5 text-[1.75rem] font-extrabold tracking-[-0.04em] text-[#342326] sm:text-[2.15rem]">Sign in</h2><p className="m-0 text-sm text-[#74676a]">Everything you need for today's service.</p></div>
            <form className="grid gap-3.5 sm:gap-4" onSubmit={handleSubmit(onSubmit)} noValidate>
              {serverError && <div className="form-alert rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700" role="alert">{serverError}</div>}
              <FormField label="Email address" error={errors.email?.message} required>
                <div className="input-with-icon"><Mail size={18} /><input className="login-input !pl-11 !pr-11" type="email" autoComplete="email" placeholder="name@restaurant.com" {...register("email", { required: "Email is required", pattern: { value: /^\S+@\S+\.\S+$/, message: "Enter a valid email" } })} /></div>
              </FormField>
              <FormField label="Password" error={errors.password?.message} required>
                <div className="input-with-icon"><LockKeyhole size={18} /><input className="login-input !pl-11 !pr-11" type={showPassword ? "text" : "password"} autoComplete="current-password" placeholder="Enter your password" {...register("password", { required: "Password is required" })} /><button type="button" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? "Hide password" : "Show password"}>{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button></div>
              </FormField>
              <Button type="submit" size="lg" loading={isSubmitting} className="login-submit mt-1 w-full justify-center">Sign in</Button>
            </form>
            <p className="login-card__help mx-auto mb-0 mt-4 max-w-sm text-center text-xs leading-relaxed text-[#74676a]">Need help? Ask your manager.</p>
          </div>
          <div className="login-capabilities hidden" aria-label="RestoHub features">
            <span className="inline-flex min-h-8 items-center gap-1.5 rounded-full border border-[#efdcd6] bg-white/60 px-2.5 py-1.5 text-[0.7rem] font-bold text-[#80676b]"><ClipboardList className="text-brand-500" size={15} /> Orders</span>
            <span className="inline-flex min-h-8 items-center gap-1.5 rounded-full border border-[#efdcd6] bg-white/60 px-2.5 py-1.5 text-[0.7rem] font-bold text-[#80676b]"><Table2 className="text-brand-500" size={15} /> Tables</span>
            <span className="inline-flex min-h-8 items-center gap-1.5 rounded-full border border-[#efdcd6] bg-white/60 px-2.5 py-1.5 text-[0.7rem] font-bold text-[#80676b]"><UtensilsCrossed className="text-brand-500" size={15} /> Kitchen</span>
          </div>
        </div>
      </section>
    </main>
  );
}
