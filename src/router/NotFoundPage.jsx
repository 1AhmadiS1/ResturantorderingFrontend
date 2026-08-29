import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

export default function NotFoundPage() {
  return <div className="not-found"><span>404</span><h1>This page is not on the menu.</h1><p>The address may be incorrect, or your role may not have access.</p><Link className="button button--primary button--md" to="/"><ArrowLeft size={17} /> Back to workspace</Link></div>;
}

