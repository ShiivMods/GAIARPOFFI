"use client";
import { useFormStatus } from "react-dom";
import type { ReactNode } from "react";
export function CommandButton({ children, disabled, confirmText, className, pressed }: { children: ReactNode; disabled?: boolean; confirmText?: string; className?:string; pressed?:boolean }) {
  const { pending } = useFormStatus();
  return <button type="submit" className={className} aria-pressed={pressed} disabled={disabled || pending}
    onClick={event => { if (confirmText && !window.confirm(confirmText)) event.preventDefault(); }}>
    {pending ? "Enregistrement…" : children}
  </button>;
}
