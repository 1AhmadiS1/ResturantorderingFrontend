import { AlertTriangle, Inbox, LoaderCircle } from "lucide-react";
import { Button } from "./Button";

export function LoadingState({ label = "Loading..." }) {
  return <div className="state-view state-view--compact"><LoaderCircle className="spin" size={24} /><span>{label}</span></div>;
}

export function EmptyState({ title = "Nothing here yet", message, action }) {
  return <div className="state-view"><Inbox size={34} /><h3>{title}</h3>{message && <p>{message}</p>}{action}</div>;
}

export function ErrorState({ message = "We couldn't load this data.", onRetry }) {
  return <div className="state-view"><AlertTriangle size={34} /><h3>Something went wrong</h3><p>{message}</p>{onRetry && <Button variant="secondary" onClick={onRetry}>Try again</Button>}</div>;
}

