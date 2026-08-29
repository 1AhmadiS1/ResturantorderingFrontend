import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider } from "react-router-dom";
import { AuthProvider } from "./features/auth/AuthProvider";
import { queryClient } from "./lib/queryClient";
import { router } from "./router";
import { ToastProvider } from "./shared/components/ToastProvider";
import "./styles/index.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <ToastProvider><AuthProvider><RouterProvider router={router} /></AuthProvider></ToastProvider>
    </QueryClientProvider>
  </StrictMode>,
);
