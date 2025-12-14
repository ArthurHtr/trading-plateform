import { authClient } from "@/features/authentification/client/authClient";

export const backtestApi = {
  create: async (data: any) => {
    const res = await fetch("/api/backtests", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || "Failed to create backtest");
    }
    
    return res.json();
  },
  
  get: async (id: string) => {
    const res = await fetch(`/api/backtests/${id}`);
    if (!res.ok) {
      throw new Error("Failed to fetch backtest");
    }
    return res.json();
  }
};
