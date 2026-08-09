"use client";

import Link from "next/link";
import { myUtils } from "../utils/utils.js";
import { useHome } from "@/hooks/useHome";

// Shadcn UI components
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// Refactored components
import { DynamicIcon } from "@/components/ui/dynamic-icon";
import { AccountCard } from "@/components/AccountCard";
import { AccountDialog } from "@/components/AccountDialog";
import { TransactionDialog } from "@/components/TransactionDialog";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { MenuDialog } from "@/components/MenuDialog";

export default function Home() {
  const {
    dateLabel,
    loading,
    menuOpen,
    setMenuOpen,
    loadData,
    accountsHook,
    transactionsHook,
    confirmDialog,
    setConfirmDialog,
  } = useHome();

  const { accounts, totalBalance, openAccountPopup, openEditAccountPopup, handleDeleteAccount } =
    accountsHook;

  const {
    filterMonth,
    setFilterMonth,
    paginatedTransactions,
    totalPages,
    displayCurrentPage,
    filteredAndSortedTransactions,
    startIndex,
    pageSize,
    setPageSize,
    searchQuery,
    setSearchQuery,
    sortColumn,
    sortDirection,
    handleSort,
    setCurrentPage,
    openTransactionPopup,
    handleDeleteTransaction,
    fileInputRef,
    handleExport,
    handleImportChange,
    handleApplyFilter,
    handleResetFilter,
  } = transactionsHook;

  return (
    <main className="relative min-h-screen bg-slate-50">
      <div className="flex z-10 bg-opacity-50 gap-2 justify-center fixed bottom-0 w-full py-3 bg-gray-100 rounded-t-3xl text-sm">
        <button
          className="bg-white flex items-center justify-center px-3 py-1 rounded-full gap-2 text-blue-800 border"
          onClick={() => openTransactionPopup("trf")}
        >
          Trf
          <DynamicIcon name="arrow-right-left" className="w-4 h-4" />
        </button>
        <button
          className="bg-white border flex items-center justify-center px-3 py-1 rounded-full gap-2 text-green-800"
          onClick={() => openTransactionPopup("inc")}
        >
          Inc
          <DynamicIcon name="banknote" className="w-4 h-4" />
        </button>
        <button
          className="bg-white border flex items-center justify-center px-3 py-1 rounded-full gap-2 text-red-800"
          onClick={() => openTransactionPopup("exp")}
        >
          Exp
          <DynamicIcon name="banknote" className="w-4 h-4" />
        </button>
      </div>

      <div className="fixed z-10 w-screen nav flex justify-between items-center bg-white p-5 drop-shadow-sm filter">
        <div className="absolute bottom-0" id="particles-js"></div>
        <div>
          <div>
            <p className="text-xs text-gray-500">assets</p>
            <p
              id="ttl-assets"
              className="whitespace-normal text-sm leading-4"
              style={{ maxWidth: "11rem", overflowWrap: "anywhere" }}
            >
              IDR {myUtils.formatMoney(totalBalance)}
            </p>
          </div>
          <p className="text-sm whitespace-nowrap" id="dateNow">
            {dateLabel}
          </p>
        </div>

        <div className="flex gap-2">
          <button
            className="bg-blue-100 rounded-full drop-shadow-lg w-10 h-10 z-10 flex justify-center items-center text-blue-900"
            id="refresh-btn"
            onClick={() => loadData()}
          >
            <DynamicIcon name="refresh-ccw" className="w-5 h-5" />
          </button>

          <button
            className="bg-gray-100 rounded-full drop-shadow-lg w-10 h-10 z-10 flex justify-center items-center text-gray-900"
            id="menu-btn"
            onClick={() => setMenuOpen((current) => !current)}
          >
            <DynamicIcon name="ellipsis" className="w-5 h-5" />
          </button>
        </div>
      </div>

      <br />
      <br />
      <br />
      <br />



      <div className="p-2">
        <div>
          <div className="flex justify-between items-center border-b border-stone-300 pb-2">
            <div className="flex gap-3 items-center">
              <div className="bg-blue-50 w-9 h-9 flex justify-center items-center rounded-full text-blue-900">
                <DynamicIcon name="credit-card" className="w-5 h-5" />
              </div>
              <h1>Accounts</h1>
            </div>
            <button id="btn-add-acc" onClick={openAccountPopup}>
              <DynamicIcon name="plus" className="w-5 h-5" />
            </button>
          </div>
          <div
            className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 py-2 items-center justify-center"
            id="container-accounts"
          >
            {accounts.map((account) => (
              <AccountCard
                key={account.id}
                account={account}
                onClick={(acc) =>
                  openTransactionPopup("exp", { fromAccountId: acc.id })
                }
                onEdit={openEditAccountPopup}
                onDelete={handleDeleteAccount}
              />
            ))}
          </div>
        </div>

        <div className="pt-5 pb-12">
          <div className="flex justify-between items-center border-b border-stone-300 pb-2">
            <div className="flex gap-3 items-center">
              <div className="bg-yellow-50 w-9 h-9 flex justify-center items-center rounded-full text-yellow-900">
                <DynamicIcon name="arrow-down-up" className="w-5 h-5" />
              </div>
              <h1>Transactions</h1>
            </div>
          </div>

          <div className="mt-4 flex items-end gap-3 rounded-2xl border border-slate-200 bg-white/80 p-3 shadow-sm backdrop-blur-sm">
            <div className="flex min-w-0 flex-1 flex-col gap-1">
              <label
                htmlFor="filter-month"
                className="text-base text-slate-500"
              >
                Month and year
              </label>
              <input
                type="month"
                id="filter-month"
                className="w-fit border px-3 py-2 rounded-xl text-base"
                value={filterMonth}
                onChange={(event) => setFilterMonth(event.target.value)}
              />
            </div>
             <button
              id="btn-filter-trc"
              className="shrink-0 rounded-xl bg-blue-600 px-4 py-2 font-medium text-white shadow-sm transition hover:bg-blue-700"
              onClick={handleApplyFilter}
            >
              Filter
            </button>
            <button
              id="btn-reset-filter"
              className="shrink-0 rounded-xl border border-slate-200 bg-white px-4 py-2 font-medium text-slate-700 transition hover:bg-slate-50"
              onClick={handleResetFilter}
            >
              Bulan ini
            </button>
          </div>

          <div className="dataTables_wrapper mt-4">
            <div className="trc-toolbar my-4 flex items-center justify-between gap-3 flex-wrap">
              <div className="trc-length dataTables_length">
                <label className="flex items-center gap-2 text-sm text-slate-500">
                  Show
                  <select
                    value={pageSize}
                    onChange={(event) => {
                      setPageSize(Number(event.target.value));
                      setCurrentPage(1);
                    }}
                    className="border px-2 py-1 rounded-lg text-sm bg-white"
                  >
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                  </select>
                  entries
                </label>
              </div>
              <div className="trc-search dataTables_filter ml-auto">
                <label className="flex items-center gap-2 text-sm text-slate-500">
                  Search:
                  <input
                    type="search"
                    className="border px-3 py-1.5 rounded-lg text-sm bg-white focus:outline-none"
                    value={searchQuery}
                    onChange={(event) => {
                      setSearchQuery(event.target.value);
                      setCurrentPage(1);
                    }}
                  />
                </label>
              </div>
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-100 bg-white shadow-xs">
              <Table id="tableTrans" style={{ minWidth: "900px" }}>
                <TableHeader>
                  <TableRow className="text-xs border-b border-slate-100 bg-slate-50/50">
                    <TableHead
                      className="cursor-pointer select-none py-3 text-slate-500 font-medium h-10"
                      onClick={() => handleSort("date")}
                    >
                      <div className="flex items-center gap-1">
                        Date{" "}
                        {sortColumn === "date"
                          ? sortDirection === "asc"
                            ? " ▲"
                            : " ▼"
                          : ""}
                      </div>
                    </TableHead>
                    <TableHead
                      className="cursor-pointer select-none py-3 text-slate-500 font-medium h-10"
                      onClick={() => handleSort("desc")}
                    >
                      <div className="flex items-center gap-1">
                        Descriptions{" "}
                        {sortColumn === "desc"
                          ? sortDirection === "asc"
                            ? " ▲"
                            : " ▼"
                          : ""}
                      </div>
                    </TableHead>
                    <TableHead
                      className="cursor-pointer select-none py-3 text-slate-500 font-medium h-10"
                      onClick={() => handleSort("status")}
                    >
                      <div className="flex items-center gap-1">
                        Status{" "}
                        {sortColumn === "status"
                          ? sortDirection === "asc"
                            ? " ▲"
                            : " ▼"
                          : ""}
                      </div>
                    </TableHead>
                    <TableHead
                      className="cursor-pointer select-none py-3 text-slate-500 font-medium h-10"
                      onClick={() => handleSort("from")}
                    >
                      <div className="flex items-center gap-1">
                        From{" "}
                        {sortColumn === "from"
                          ? sortDirection === "asc"
                            ? " ▲"
                            : " ▼"
                          : ""}
                      </div>
                    </TableHead>
                    <TableHead
                      className="cursor-pointer select-none py-3 text-slate-500 font-medium h-10"
                      onClick={() => handleSort("to")}
                    >
                      <div className="flex items-center gap-1">
                        To{" "}
                        {sortColumn === "to"
                          ? sortDirection === "asc"
                            ? " ▲"
                            : " ▼"
                          : ""}
                      </div>
                    </TableHead>
                    <TableHead
                      className="cursor-pointer select-none py-3 text-slate-500 font-medium h-10"
                      onClick={() => handleSort("amount")}
                    >
                      <div className="flex items-center gap-1">
                        Amount{" "}
                        {sortColumn === "amount"
                          ? sortDirection === "asc"
                            ? " ▲"
                            : " ▼"
                          : ""}
                      </div>
                    </TableHead>
                    <TableHead className="py-3 text-slate-500 font-medium h-10">
                      Action
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody id="trc-body">
                  {paginatedTransactions.map((trc) => (
                    <TableRow
                      key={trc.id}
                      className="align-top hover:bg-slate-50/50 transition-colors border-b border-slate-100 text-sm sm:text-xs"
                    >
                      <TableCell className="whitespace-nowrap py-3 font-mono text-slate-600">
                        {trc.date}
                      </TableCell>
                      <TableCell
                        className="whitespace-normal py-3 text-slate-700"
                        style={{ overflowWrap: "anywhere" }}
                      >
                        {trc.desc}
                      </TableCell>
                      <TableCell className="py-3">
                        <div
                          className={`w-7 h-7 flex justify-center items-center rounded-full ${trc.status === "in" ? "bg-green-100 text-green-900" : trc.status === "ex" ? "bg-red-100 text-red-900" : "bg-blue-100 text-blue-900"}`}
                        >
                          <DynamicIcon
                            name={
                              trc.status === "in"
                                ? "arrow-up"
                                : trc.status === "ex"
                                  ? "arrow-down"
                                  : "arrow-right-left"
                            }
                            className="w-4 h-4"
                          />
                        </div>
                      </TableCell>
                      <TableCell className="py-3">
                        {trc.status === "trf" || trc.status === "ex" ? (
                          <div
                            className={`flex bg-${trc.bg_from}-100 text-${trc.clr_from}-900 px-3 py-1 gap-1 rounded-full items-center w-fit text-xs`}
                          >
                            <DynamicIcon
                              name={trc.acc_from?.icon || "smile-plus"}
                              className="w-4 h-4"
                            />
                            <p>{trc.acc_from?.name}</p>
                          </div>
                        ) : (
                          "-"
                        )}
                      </TableCell>
                      <TableCell className="py-3">
                        {trc.status === "trf" || trc.status === "in" ? (
                          <div
                            className={`flex bg-${trc.bg_to}-100 text-${trc.clr_to}-900 px-3 py-1 gap-1 rounded-full items-center w-fit text-xs`}
                          >
                            <DynamicIcon
                              name={trc.acc_to?.icon || "smile-plus"}
                              className="w-4 h-4"
                            />
                            <p>{trc.acc_to?.name}</p>
                          </div>
                        ) : (
                          "-"
                        )}
                      </TableCell>
                      <TableCell className="whitespace-nowrap py-3 font-medium text-slate-900">
                        IDR {myUtils.formatMoney(trc.amount)}
                      </TableCell>
                      <TableCell className="py-3">
                        <div className="flex gap-3">
                          <button
                            type="button"
                            id="btn-delete-trc"
                            data-trc={trc.id}
                            className="text-slate-400 hover:text-red-500 transition-colors"
                            onClick={() => handleDeleteTransaction(trc)}
                          >
                            <DynamicIcon name="trash" className="w-4 h-4" />
                          </button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div className="trc-footer my-4 flex items-center justify-between gap-3 flex-wrap text-sm text-slate-500">
              <div className="dataTables_info">
                Showing{" "}
                {filteredAndSortedTransactions.length > 0 ? startIndex + 1 : 0}{" "}
                to{" "}
                {Math.min(
                  startIndex + pageSize,
                  filteredAndSortedTransactions.length,
                )}{" "}
                of {filteredAndSortedTransactions.length} entries
              </div>
              <div className="dataTables_paginate paging_simple_numbers flex gap-1">
                <button
                  type="button"
                  disabled={displayCurrentPage === 1}
                  onClick={() => setCurrentPage((p) => p - 1)}
                  className="px-3 py-1 border rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed text-xs"
                >
                  Previous
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (page) => (
                    <button
                      key={page}
                      type="button"
                      onClick={() => setCurrentPage(page)}
                      className={`px-2.5 py-1 border rounded-lg text-xs ${
                        displayCurrentPage === page
                          ? "bg-blue-600 text-white border-blue-600"
                          : "hover:bg-slate-50 bg-white"
                      }`}
                    >
                      {page}
                    </button>
                  ),
                )}
                <button
                  type="button"
                  disabled={
                    displayCurrentPage === totalPages || totalPages === 0
                  }
                  onClick={() => setCurrentPage((p) => p + 1)}
                  className="px-3 py-1 border rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed text-xs"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <AccountDialog hook={accountsHook} />

      <TransactionDialog hook={transactionsHook} accounts={accounts} />

      <ConfirmDialog
        confirmDialog={confirmDialog}
        setConfirmDialog={setConfirmDialog}
      />

      <MenuDialog
        open={menuOpen}
        onOpenChange={setMenuOpen}
        handleExport={handleExport}
        fileInputRef={fileInputRef}
        handleImportChange={handleImportChange}
      />
    </main>
  );
}
