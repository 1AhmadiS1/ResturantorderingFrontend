import { AlertTriangle, Inbox, LoaderCircle } from "lucide-react";
import { Button } from "./Button";

export function LoadingState({ label = "Loading..." }) {
  return <div className="state-view state-view--compact flex min-h-44 items-center justify-center gap-2.5 px-5 text-center text-sm text-[#74676a]"><LoaderCircle className="spin mb-0 text-brand-500" size={24} /><span>{label}</span></div>;
}

export function EmptyState({ title = "Nothing here yet", message, action }) {
  return <div className="state-view flex min-h-[280px] flex-col items-center justify-center px-5 py-8 text-center text-[#74676a]"><Inbox className="mb-3 text-[#b19fa2]" size={34} /><h3 className="mb-1.5 text-base font-extrabold text-[#2f2325]">{title}</h3>{message && <p className="mb-4 max-w-sm text-sm leading-relaxed">{message}</p>}{action}</div>;
}

export function ErrorState({ message = "We couldn't load this data.", onRetry }) {
  return <div className="state-view flex min-h-[280px] flex-col items-center justify-center px-5 py-8 text-center text-[#74676a]"><AlertTriangle className="mb-3 text-red-500" size={34} /><h3 className="mb-1.5 text-base font-extrabold text-[#2f2325]">Something went wrong</h3><p className="mb-4 max-w-sm text-sm leading-relaxed">{message}</p>{onRetry && <Button variant="secondary" onClick={onRetry}>Try again</Button>}</div>;
}
