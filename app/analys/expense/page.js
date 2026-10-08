"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Chart, registerables } from "chart.js";
import { Home as HomeIcon } from "lucide-react";
import { accountServices } from "../../../services/accountService.js";
import { TransactionModel } from "../../../models/transactionModel.js";
import { myUtils } from "../../../utils/utils.js";

Chart.register(...registerables);

export default function ExpenseByAccountPage() {
  const [accounts, setAccounts] = useState([]);
  const [startDate, setStartDate] = useState(() => {
    const now = new Date();
    return myUtils.formatDate(new Date(now.getFullYear(), now.getMonth(), 1));
  });
  const [endDate, setEndDate] = useState(() => {
    const now = new Date();
    return myUtils.formatDate(new Date(now.getFullYear(), now.getMonth() + 1, 0));
  });
  const [expenseAccounts, setExpenseAccounts] = useState([]);
  const chartRef = useRef(null);
  const chartInstanceRef = useRef(null);

  useEffect(() => {
    let active = true;

    accountServices.getAll().then((accountList) => {
      if (active) setAccounts(accountList);
    });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!startDate || !endDate) return;

    let active = true;

    TransactionModel.getDataFromRange(startDate, endDate).then((transactions) => {
      if (!active) return;

      const accountNames = new Map(
        accounts.map((account) => [account.id, account.name])
      );
      const expensesByAccount = new Map();

      transactions.forEach((transaction) => {
        if (transaction.status !== "ex") return;

        const accountId = transaction.from_account_id;
        const accountExpense = expensesByAccount.get(accountId) ?? {
          name: accountNames.get(accountId) ?? "Unknown account",
          amount: 0,
        };
        accountExpense.amount += transaction.amount;
        expensesByAccount.set(accountId, accountExpense);
      });

      setExpenseAccounts(
        [...expensesByAccount.values()].filter((account) => account.amount > 0)
      );
    });

    return () => {
      active = false;
    };
  }, [accounts, startDate, endDate]);

  useEffect(() => {
    if (!chartRef.current) return;

    chartInstanceRef.current = new Chart(chartRef.current, {
      type: "doughnut",
      data: {
        labels: [],
        datasets: [
          {
            data: [],
            backgroundColor: [],
            borderColor: "#ffffff",
            borderWidth: 2,
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: "bottom",
            labels: {
              generateLabels(chart) {
                const values = chart.data.datasets[0].data;
                const total = values.reduce((sum, value) => sum + value, 0);

                return chart.data.labels.map((label, index) => ({
                  text: `${label} (${total ? Math.round((values[index] / total) * 100) : 0}%)`,
                  fillStyle: chart.data.datasets[0].backgroundColor[index],
                  strokeStyle: chart.data.datasets[0].borderColor,
                  lineWidth: chart.data.datasets[0].borderWidth,
                  hidden: false,
                  index,
                }));
              },
            },
          },
          tooltip: {
            callbacks: {
              label(context) {
                const values = context.dataset.data;
                const total = values.reduce((sum, value) => sum + value, 0);
                const percentage = total
                  ? Math.round((context.raw / total) * 100)
                  : 0;
                return `Expense: IDR ${myUtils.formatMoney(context.raw)} (${percentage}%)`;
              },
            },
          },
        },
      },
    });

    return () => {
      chartInstanceRef.current?.destroy();
      chartInstanceRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!chartInstanceRef.current) return;

    chartInstanceRef.current.data.labels = expenseAccounts.map(
      (account) => account.name
    );
    chartInstanceRef.current.data.datasets[0].data = expenseAccounts.map(
      (account) => account.amount
    );
    chartInstanceRef.current.data.datasets[0].backgroundColor =
      expenseAccounts.map((_, index) => `hsl(${(index * 137.508) % 360} 65% 55%)`);
    chartInstanceRef.current.update();
  }, [expenseAccounts]);

  const totalExpense = expenseAccounts.reduce(
    (total, account) => total + account.amount,
    0
  );

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="flex items-center justify-between bg-white p-5 shadow-sm">
        <div>
          <h1 className="text-lg font-semibold text-slate-800">
            Expense by Account
          </h1>
          <p className="text-sm text-slate-500">
            Total expense: IDR {myUtils.formatMoney(totalExpense)}
          </p>
        </div>
        <Link
          href="/"
          aria-label="Home"
          className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-900 shadow"
        >
          <HomeIcon className="h-5 w-5" />
        </Link>
      </header>

      <section className="mx-auto flex w-full max-w-2xl flex-col gap-5 p-5">
        <div className="flex flex-wrap items-end gap-3">
          <div className="flex flex-col gap-1">
            <label htmlFor="expense-start" className="text-sm text-gray-500">
              Start date
            </label>
            <input
              type="date"
              id="expense-start"
              className="rounded-full border bg-white px-3 py-1.5 text-sm"
              value={startDate}
              onChange={(event) => setStartDate(event.target.value)}
            />
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="expense-end" className="text-sm text-gray-500">
              End date
            </label>
            <input
              type="date"
              id="expense-end"
              className="rounded-full border bg-white px-3 py-1.5 text-sm"
              value={endDate}
              onChange={(event) => setEndDate(event.target.value)}
            />
          </div>
        </div>

        <div className="mx-auto w-full max-w-md">
          <canvas ref={chartRef} id="expenseByAccountChart"></canvas>
        </div>
        {totalExpense === 0 && (
          <p className="text-center text-sm text-gray-500">
            No expenses in this date range
          </p>
        )}
      </section>
    </main>
  );
}
