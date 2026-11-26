"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export function LiveRefresh() {
  const router = useRouter();
  useEffect(() => {
    const timer = window.setInterval(() => {
      if (document.visibilityState === "visible") router.refresh();
    }, 3000);
    return () => window.clearInterval(timer);
  }, [router]);
  return <button type="button" onClick={() => router.refresh()}>Actualiser maintenant</button>;
}
