"use client";
import { useFormStatus } from "react-dom";
import type { ReactNode } from "react";
export function CommandButton({ children, disabled, confirmText }: { children: ReactNode; disabled?: boolean; confirmText?: string }) {
  const { pending } = useFormStatus();
  return <button type="submit" disabled={disabled || pending}
    onClick={event => { if (confirmText && !window.confirm(confirmText)) event.preventDefault(); }}>
    {pending ? "Enregistrement…" : children}
  </button>;
}
