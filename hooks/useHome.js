import { useEffect, useState } from "react";
import { useAccounts } from "./useAccounts.js";
import { useTransactions } from "./useTransactions.js";

export function useHome() {
  const [dateLabel, setDateLabel] = useState("");
  const [loading, setLoading] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    title: "",
    description: "",
    confirmText: "Yes!",
    cancelText: "Cancel",
    onConfirm: null,
  });

  const loadData = async (startDate, endDate) => {
    setLoading(true);
    try {
      const accList = await accountsHook.loadAccounts();
      await transactionsHook.loadTransactions(accList, startDate, endDate);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const accountsHook = useAccounts({
    setConfirmDialog,
    loadData: (startDate, endDate) => loadData(startDate, endDate),
  });

  const transactionsHook = useTransactions({
    accounts: accountsHook.accounts,
    setConfirmDialog,
    loadData: (startDate, endDate) => loadData(startDate, endDate),
  });

  useEffect(() => {
    const now = new Date();
    setTimeout(() => {
      setDateLabel(
        now.toLocaleDateString("en-US", {
          weekday: "short",
          day: "numeric",
          month: "short",
          year: "numeric",
        })
      );
    }, 0);

    loadData();

    let intervalParticles = null;
    import("particles.js").then(() => {
      const initParticles = () => {
        if (window.particlesJS) {
          window.particlesJS.load("particles-js", "/assets/particles.json", function () {});
          return true;
        }
        return false;
      };

      if (!initParticles()) {
        intervalParticles = setInterval(() => {
          if (initParticles()) {
            clearInterval(intervalParticles);
          }
        }, 100);
      }
    });

    return () => {
      if (intervalParticles) clearInterval(intervalParticles);
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      const menu = document.getElementById("menu-div");
      const menuBtn = document.getElementById("menu-btn");

      if (!document.body.contains(e.target)) return;

      if (menu && menuBtn && !menu.contains(e.target) && !menuBtn.contains(e.target)) {
        setMenuOpen(false);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  return {
    dateLabel,
    loading,
    confirmDialog,
    setConfirmDialog,
    menuOpen,
    setMenuOpen,
    loadData,
    accountsHook,
    transactionsHook,
  };
}
