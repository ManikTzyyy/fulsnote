
export const COLORS = ["red", "green", "blue", "yellow", "purple", "pink", "indigo", "gray"];

export function getWalletAccount(accounts) {
  return accounts.find((item) => /wallet|dompet/i.test(item.name)) || null;
}

export function getDefaultCardColor(accounts, selectedId) {
  const walletAccount = getWalletAccount(accounts);
  return walletAccount?.id ?? accounts.find((item) => item.id !== selectedId)?.id ?? null;
}

export function formatStatusBadge(type) {
  if (type === "inc") {
    return { label: "Income", icon: "arrow-up", bg: "bg-green-100", clr: "text-green-800" };
  }

  if (type === "exp") {
    return { label: "Expense", icon: "arrow-down", bg: "bg-red-100", clr: "text-red-800" };
  }

  return { label: "Transfer", icon: "arrow-right-left", bg: "bg-blue-100", clr: "text-blue-800" };
}
