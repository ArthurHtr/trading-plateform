export const portfolioApi = {
  list: async () => {
    const res = await fetch("/api/portfolios");
    if (!res.ok) throw new Error("Failed to fetch portfolios");
    return res.json();
  },
  
  get: async (id: string) => {
    const res = await fetch(`/api/portfolios/${id}`);
    if (!res.ok) throw new Error("Failed to fetch portfolio");
    return res.json();
  },

  create: async (data: { name: string; symbols: string[] }) => {
    const res = await fetch("/api/portfolios", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Failed to create portfolio");
    return res.json();
  },

  update: async (id: string, data: { name?: string; symbols?: string[] }) => {
    const res = await fetch(`/api/portfolios/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Failed to update portfolio");
    return res.json();
  },

  delete: async (id: string) => {
    const res = await fetch(`/api/portfolios/${id}`, {
      method: "DELETE",
    });
    if (!res.ok) throw new Error("Failed to delete portfolio");
    return res.json();
  }
};
