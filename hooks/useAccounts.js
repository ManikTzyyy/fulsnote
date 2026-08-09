import { useMemo, useState } from "react";
import * as LucideIcons from "lucide-react";
import { toast } from "sonner";
import { accountServices } from "../services/accountService.js";
import { myUtils } from "../utils/utils.js";

export function useAccounts({ setConfirmDialog, loadData }) {
  const [accounts, setAccounts] = useState([]);
  const [accountPopupOpen, setAccountPopupOpen] = useState(false);
  const [editingAccountId, setEditingAccountId] = useState(null);
  const [iconList, setIconList] = useState([]);
  const [accountForm, setAccountForm] = useState({
    name: "",
    balance: "0",
    icon: "SmilePlus",
    bg_clr: "blue",
    ic_clr: "blue",
  });
  const [showIconBox, setShowIconBox] = useState(false);
  const [iconSearch, setIconSearch] = useState("");

  const iconOptions = useMemo(
    () => iconList.filter((item) => item.toLowerCase().includes(iconSearch.toLowerCase())).slice(0, 50),
    [iconList, iconSearch]
  );

  const totalBalance = useMemo(
    () => accounts.reduce((sum, account) => sum + Number(account.balance || 0), 0),
    [accounts]
  );

  async function loadAccounts() {
    const list = await accountServices.getAll();
    setAccounts(list);
    return list;
  }

  function openAccountPopup() {
    setEditingAccountId(null);
    setAccountForm({
      name: "",
      balance: "0",
      icon: "SmilePlus",
      bg_clr: "blue",
      ic_clr: "blue",
    });
    setAccountPopupOpen(true);
    setShowIconBox(false);
    document.getElementById("acc-name")?.classList.remove("border-red-500");
    document.getElementById("acc-start")?.classList.remove("border-red-500");
  }

  function openEditAccountPopup(acc) {
    setEditingAccountId(acc.id);
    setAccountForm({
      name: acc.name,
      balance: acc.balance ? myUtils.formatMoney(acc.balance) : "0",
      icon: acc.icon || "SmilePlus",
      bg_clr: acc.bg_clr || "blue",
      ic_clr: acc.ic_clr || "blue",
    });
    setAccountPopupOpen(true);
    setShowIconBox(false);
    document.getElementById("acc-name")?.classList.remove("border-red-500");
    document.getElementById("acc-start")?.classList.remove("border-red-500");
  }

  function closeAccountPopup() {
    setAccountPopupOpen(false);
    setEditingAccountId(null);
    setShowIconBox(false);
  }

  const handleSelectIconClick = () => {
    setShowIconBox((current) => !current);
    if (iconList.length === 0) {
      setIconList(Object.keys(LucideIcons).filter(key => typeof LucideIcons[key] === "function" || typeof LucideIcons[key] === "object"));
    }
  };

  async function handleSaveAccount() {
    const errorName = !accountForm.name.trim();
    if (errorName) {
      document.getElementById("acc-name")?.classList.add("border-red-500");
      return;
    }

    try {
      const accStartValue = Number(String(accountForm.balance || "0").replace(/\./g, ""));
      if (editingAccountId) {
        await accountServices.updateAccount(
          editingAccountId,
          accountForm.name,
          accStartValue,
          accountForm.icon,
          accountForm.bg_clr,
          accountForm.ic_clr
        );
        toast.success("Account updated successfully");
      } else {
        await accountServices.createAccount(
          accountForm.name,
          accStartValue,
          accountForm.icon,
          accountForm.bg_clr,
          accountForm.ic_clr
        );
        toast.success("Account created successfully");
      }

      setAccountForm({
        name: "",
        balance: "0",
        icon: "SmilePlus",
        bg_clr: "blue",
        ic_clr: "blue",
      });
      setEditingAccountId(null);
      closeAccountPopup();
      await loadData();
    } catch (error) {
      console.log(error);
    }
  }

  async function handleDeleteAccount(idAcc) {
    setConfirmDialog({
      open: true,
      title: "Delete this Account?",
      description: "Are you sure you want to delete this account? This action cannot be undone.",
      confirmText: "Delete",
      cancelText: "Cancel",
      onConfirm: async () => {
        try {
          await accountServices.delete(idAcc);
          toast.success("Account deleted successfully");
          await loadData();
        } catch (error) {
          toast.error("Failed to delete account");
          console.error(error);
        }
      },
    });
  }

  const selectedIconPreview = accountForm.icon;
  const availableIcons = iconOptions;

  return {
    accounts,
    setAccounts,
    totalBalance,
    loadAccounts,
    accountPopupOpen,
    openAccountPopup,
    openEditAccountPopup,
    closeAccountPopup,
    editingAccountId,
    accountForm,
    setAccountForm,
    showIconBox,
    setShowIconBox,
    iconSearch,
    setIconSearch,
    handleSelectIconClick,
    handleSaveAccount,
    handleDeleteAccount,
    selectedIconPreview,
    availableIcons,
  };
}
