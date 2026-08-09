import { useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { TransactionService } from "../services/transactionService.js";
import { accountServices } from "../services/accountService.js";
import { db } from "../db/database.js";
import { myUtils } from "../utils/utils.js";
import { getWalletAccount, formatStatusBadge } from "../utils/helpers.js";

export function useTransactions({ accounts, setConfirmDialog, loadData }) {
  const fileInputRef = useRef(null);
  const [transactions, setTransactions] = useState([]);
  const [filterMonth, setFilterMonth] = useState(() => {
    const { startDate } = TransactionService.getCurrentMonthRange();
    return startDate.slice(0, 7);
  });
  const [transactionPopupOpen, setTransactionPopupOpen] = useState(false);
  const [transactionType, setTransactionType] = useState(null);
  const [selectedAccountId, setSelectedAccountId] = useState(null);
  const [isIncome, setIsIncome] = useState(null);
  const [transactionForm, setTransactionForm] = useState({
    date: "",
    desc: "",
    amount: "0",
    from_account_id: "",
    to_account_id: "",
  });

  // Sorting, searching, and pagination state variables
  const [searchQuery, setSearchQuery] = useState("");
  const [sortColumn, setSortColumn] = useState("date");
  const [sortDirection, setSortDirection] = useState("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  async function loadTransactions(accList, startDate, endDate) {
    let currentRange;
    if (startDate && endDate) {
      currentRange = { startDate, endDate };
    } else if (filterMonth) {
      const [year, month] = filterMonth.split("-").map(Number);
      const start = `${year}-${String(month).padStart(2, "0")}-01`;
      const end = TransactionService.formatLocalDate(new Date(year, month, 0));
      currentRange = { startDate: start, endDate: end };
    } else {
      currentRange = TransactionService.getCurrentMonthRange();
    }

    const trcList = await TransactionService.getByRange(currentRange.startDate, currentRange.endDate);
    setTransactions(myUtils.getAllWithAcc(trcList, accList));
    setFilterMonth(currentRange.startDate.slice(0, 7));
    return trcList;
  }

  function openTransactionPopup(type, preset = {}) {
    const walletAccount = getWalletAccount(accounts);
    const fallbackAccountId = accounts[0]?.id ?? "";
    const fromId =
      preset.fromAccountId ??
      (type === "trf"
        ? walletAccount?.id ?? accounts.find((item) => item.id !== preset.toAccountId)?.id ?? fallbackAccountId
        : walletAccount?.id ?? fallbackAccountId);
    const toId =
      preset.toAccountId ??
      (type === "exp"
        ? accounts.find((item) => item.id !== fromId)?.id ?? fallbackAccountId
        : type === "inc"
          ? walletAccount?.id ?? fallbackAccountId
          : accounts.find((item) => item.id !== fromId)?.id ?? fallbackAccountId);

    setTransactionType(type);
    setIsIncome(type === "inc");
    setSelectedAccountId(type === "exp" ? preset.fromAccountId ?? null : preset.toAccountId ?? null);
    
    setTransactionForm({
      date: myUtils.formatDate(new Date()),
      desc: "",
      amount: "0",
      from_account_id: String(fromId || ""),
      to_account_id: String(toId || ""),
    });
    
    document.getElementById("trnc-date")?.classList.remove("border-red-500");
    document.getElementById("trnc-desc")?.classList.remove("border-red-500");
    document.getElementById("trc-value")?.classList.remove("border-red-500");
    document.getElementById("acc-ref-from")?.classList.remove("border-red-500");
    document.getElementById("acc-ref-to")?.classList.remove("border-red-500");

    setTransactionPopupOpen(true);
  }

  function closeTransactionPopup() {
    setTransactionPopupOpen(false);
  }

  const handleSort = (column) => {
    if (sortColumn === column) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortColumn(column);
      setSortDirection("desc");
    }
    setCurrentPage(1);
  };

  const filteredAndSortedTransactions = useMemo(() => {
    let result = transactions;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter((trc) => {
        const descMatch = trc.desc?.toLowerCase().includes(q);
        const amountMatch = String(trc.amount).includes(q) || myUtils.formatMoney(trc.amount).includes(q);
        const fromMatch = trc.acc_from?.name?.toLowerCase().includes(q);
        const toMatch = trc.acc_to?.name?.toLowerCase().includes(q);
        const dateMatch = trc.date?.toLowerCase().includes(q);
        return descMatch || amountMatch || fromMatch || toMatch || dateMatch;
      });
    }

    if (sortColumn) {
      result = [...result].sort((a, b) => {
        let valA, valB;
        if (sortColumn === "date") {
          valA = a.date || "";
          valB = b.date || "";
        } else if (sortColumn === "desc") {
          valA = a.desc || "";
          valB = b.desc || "";
        } else if (sortColumn === "status") {
          valA = a.status || "";
          valB = b.status || "";
        } else if (sortColumn === "from") {
          valA = a.acc_from?.name || "";
          valB = b.acc_from?.name || "";
        } else if (sortColumn === "to") {
          valA = a.acc_to?.name || "";
          valB = b.acc_to?.name || "";
        } else if (sortColumn === "amount") {
          valA = Number(a.amount) || 0;
          valB = Number(b.amount) || 0;
        }

        if (valA < valB) return sortDirection === "asc" ? -1 : 1;
        if (valA > valB) return sortDirection === "asc" ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [transactions, searchQuery, sortColumn, sortDirection]);

  const totalPages = Math.ceil(filteredAndSortedTransactions.length / pageSize);
  const displayCurrentPage = currentPage > totalPages ? Math.max(1, totalPages) : currentPage;
  const startIndex = (displayCurrentPage - 1) * pageSize;
  const paginatedTransactions = useMemo(() => {
    return filteredAndSortedTransactions.slice(startIndex, startIndex + pageSize);
  }, [filteredAndSortedTransactions, startIndex, pageSize]);

  async function handleSaveTransaction() {
    const amountTrcValue = Number(String(transactionForm.amount || "0").replace(/\./g, ""));
    const errorDesc = myUtils.inputValidator("trnc-desc");
    const errorDate = myUtils.inputValidator("trnc-date");
    const errorAccTo = myUtils.inputValidator("acc-ref-to");
    const errorAccFrom = myUtils.inputValidator("acc-ref-from");

    if (errorDesc || errorDate || errorAccFrom || errorAccTo) {
      return;
    }

    const accIDTo = Number(transactionForm.to_account_id);
    const accIDfrom = Number(transactionForm.from_account_id);

    try {
      if (transactionType !== "trf") {
        const acc = await accountServices.findById(isIncome ? accIDTo : accIDfrom);

        await TransactionService.createTrc(
          transactionForm.date,
          transactionForm.desc,
          accIDfrom,
          accIDTo,
          amountTrcValue,
          isIncome ? null : acc.bg_clr,
          isIncome ? null : acc.ic_clr,
          isIncome ? acc.bg_clr : null,
          isIncome ? acc.ic_clr : null,
          isIncome
        );
      } else {
        const accFrom = await accountServices.findById(accIDfrom);
        const accTo = await accountServices.findById(accIDTo);

        if (accIDfrom === accIDTo) {
          toast.warning("Account cannot be same reference!");
          return;
        }

        await TransactionService.createTransfer(
          transactionForm.date,
          transactionForm.desc,
          accIDfrom,
          accIDTo,
          amountTrcValue,
          accFrom.bg_clr,
          accFrom.ic_clr,
          accTo.bg_clr,
          accTo.ic_clr,
          "trf"
        );
      }

      closeTransactionPopup();
      await loadData();
    } catch (error) {
      console.log(error);
    }
  }

  async function handleDeleteTransaction(trc) {
    const idTrc = Number(trc.id);
    const type = trc.status;
    const idAccToEdit = type === "in" ? trc.to_account_id : trc.from_account_id;

    setConfirmDialog({
      open: true,
      title: "Delete this Transaction?",
      description: "Are you sure you want to delete this transaction?",
      confirmText: "Delete",
      cancelText: "Cancel",
      onConfirm: async () => {
        try {
          if (type !== "trf") {
            await TransactionService.delete(idTrc, idAccToEdit, trc.amount, type === "in");
          } else {
            await TransactionService.deleteTrfType(idTrc, trc.amount, trc.from_account_id, trc.to_account_id);
          }
          toast.success("Transaction deleted successfully");
          await loadData();
        } catch (error) {
          toast.error("Failed to delete transaction");
          console.error(error);
        }
      },
    });
  }

  async function handleExport() {
    const data = await myUtils.exportData();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "backup.json";
    link.click();
    URL.revokeObjectURL(url);
  }

  async function handleImportChange(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    setConfirmDialog({
      open: true,
      title: "Import file?",
      description: "Semua data saat ini akan dihapus dan diganti dengan data dari backup.",
      confirmText: "Yes!",
      cancelText: "Cancel",
      onConfirm: async () => {
        const toastId = toast.loading("Importing backup data...");
        try {
          const text = await file.text();
          const data = JSON.parse(text);

          if (!data || !Array.isArray(data.acc) || !Array.isArray(data.trc)) {
            throw new Error("Format backup tidak valid");
          }

          await db.transaction("rw", db.accounts, db.transactions, async () => {
            await db.accounts.clear();
            await db.transactions.clear();
            await db.accounts.bulkPut(data.acc);
            await db.transactions.bulkPut(data.trc);
          });

          toast.success("Backup berhasil diimport", { id: toastId });
          setTimeout(() => {
            window.location.reload();
          }, 1000);
        } catch (error) {
          console.error(error);
          toast.error("File backup tidak valid", { id: toastId });
        } finally {
          event.target.value = "";
        }
      },
    });
  }

  const handleApplyFilter = () => {
    if (!filterMonth) return;
    const [year, month] = filterMonth.split("-").map(Number);
    const startDate = `${year}-${String(month).padStart(2, "0")}-01`;
    const endDate = TransactionService.formatLocalDate(new Date(year, month, 0));
    loadData(startDate, endDate);
  };

  const handleResetFilter = () => {
    const { startDate, endDate } = TransactionService.getCurrentMonthRange();
    setFilterMonth(startDate.slice(0, 7));
    loadData(startDate, endDate);
  };

  const status = transactionType ? formatStatusBadge(transactionType) : null;

  return {
    transactions,
    setTransactions,
    loadTransactions,
    filterMonth,
    setFilterMonth,
    transactionPopupOpen,
    openTransactionPopup,
    closeTransactionPopup,
    transactionType,
    selectedAccountId,
    isIncome,
    transactionForm,
    setTransactionForm,
    searchQuery,
    setSearchQuery,
    sortColumn,
    sortDirection,
    currentPage,
    setCurrentPage,
    pageSize,
    setPageSize,
    filteredAndSortedTransactions,
    totalPages,
    displayCurrentPage,
    paginatedTransactions,
    startIndex,
    handleSort,
    handleSaveTransaction,
    handleDeleteTransaction,
    handleExport,
    handleImportChange,
    fileInputRef,
    status,
    handleApplyFilter,
    handleResetFilter,
  };
}
