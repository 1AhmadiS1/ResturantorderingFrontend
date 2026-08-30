import { ChefHat, RefreshCw } from "lucide-react";
import { isRouteErrorResponse, useRouteError } from "react-router-dom";

export default function RouteErrorPage() {
  const error = useRouteError();
  const detail = isRouteErrorResponse(error)
    ? `${error.status} ${error.statusText}`
    : error?.message || "Unknown error";

  return (
    <main className="route-error">
      <div className="route-error__icon"><ChefHat /></div>
      <h1>Something went wrong</h1>
      <p>Refresh the page and try again.</p>
      <button className="button button--primary button--md" onClick={() => window.location.reload()}>
        <RefreshCw size={17} /> Try again
      </button>
      {import.meta.env.DEV && <details><summary>Developer details</summary><code>{detail}</code></details>}
    </main>
  );
}
