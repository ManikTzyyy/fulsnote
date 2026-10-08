"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Chart, registerables } from "chart.js";
import Swiper from "swiper";
import { Pagination } from "swiper/modules";
import { Home as HomeIcon, ArrowUp, ArrowDown } from "lucide-react";
import { accountServices } from "../../services/accountService.js";
import { TransactionModel } from "../../models/transactionModel.js";
import { myUtils } from "../../utils/utils.js";

Chart.register(...registerables);

function getPeriodInfo(date, groupBy) {
  const [year, month, day] = date.split("-").map(Number);
  const periodStart = new Date(year, month - 1, day);

  if (groupBy === "week") {
    periodStart.setDate(periodStart.getDate() - ((periodStart.getDay() + 6) % 7));
  } else if (groupBy === "month") {
    periodStart.setDate(1);
  }

  const key = myUtils.formatDate(periodStart);
  if (groupBy === "month") {
    return {
      key,
      label: periodStart.toLocaleDateString("id-ID", {
        month: "short",
        year: "numeric",
      }),
    };
  }

  if (groupBy === "week") {
    const periodEnd = new Date(periodStart);
    periodEnd.setDate(periodEnd.getDate() + 6);
    const formatWeekDate = (value) =>
      value.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        ...(periodStart.getFullYear() !== periodEnd.getFullYear()
          ? { year: "numeric" }
          : {}),
      });

    return {
      key,
      label: `${formatWeekDate(periodStart)} - ${formatWeekDate(periodEnd)}`,
    };
  }

  return {
    key,
    label: periodStart.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
    }),
  };
}

function aggregateTransactions(transactions, groupBy) {
  const grouped = new Map();

  transactions.forEach((transaction) => {
    if (!["in", "ex"].includes(transaction.status)) return;

    const period = getPeriodInfo(transaction.date, groupBy);
    const item = grouped.get(period.key) ?? {
      ...period,
      income: 0,
      expense: 0,
    };

    if (transaction.status === "in") {
      item.income += transaction.amount;
    } else {
      item.expense += transaction.amount;
    }

    grouped.set(period.key, item);
  });

  return [...grouped.values()].sort((a, b) => a.key.localeCompare(b.key));
}

export default function AnalysPage() {
  const [dateLabel, setDateLabel] = useState("");
  const [startDate, setStartDate] = useState(() => {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    return myUtils.formatDate(firstDay);
  });
  const [endDate, setEndDate] = useState(() => {
    const now = new Date();
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    return myUtils.formatDate(lastDay);
  });
  const [groupBy, setGroupBy] = useState("day");
  const [showIncome, setShowIncome] = useState(true);
  const [showExpense, setShowExpense] = useState(true);
  const [totalBalance, setTotalBalance] = useState(0);
  const [chartsInitialized, setChartsInitialized] = useState(false);
  const [accounts, setAccounts] = useState([]);
  const [selectedAccountId, setSelectedAccountId] = useState("");

  const chartRef = useRef(null);
  const cashChartRef = useRef(null);
  const chartInstanceRef = useRef(null);
  const cashChartInstanceRef = useRef(null);
  const swiperRef = useRef(null);

  const updateCharts = useCallback(async () => {
    const rawData = await TransactionModel.getDataFromRange(startDate, endDate);

    let filteredRawData = rawData;
    if (selectedAccountId) {
      const accIdNum = Number(selectedAccountId);
      filteredRawData = rawData.filter((trc) => {
        if (trc.status === "in" && trc.to_account_id === accIdNum) return true;
        if (trc.status === "ex" && trc.from_account_id === accIdNum) return true;
        if (trc.status === "trf" && (trc.from_account_id === accIdNum || trc.to_account_id === accIdNum)) return true;
        return false;
      });
    }

    const data = aggregateTransactions(filteredRawData, groupBy);

    const labels = data.map((item) => item.label);
    const income = data.map((item) => item.income);
    const expense = data.map((item) => item.expense);
    let balance = 0;
    const cashBalances = data.map((item) => {
      balance += item.income - item.expense;
      return balance;
    });
    const datasets = [];

    if (showIncome) {
      datasets.push({
        label: "Income",
        data: income,
        borderColor: "#22c55e",
        backgroundColor: "#22c55e",
      });
    }

    if (showExpense) {
      datasets.push({
        label: "Expense",
        data: expense,
        borderColor: "#ef4444",
        backgroundColor: "#ef4444",
      });
    }

    if (chartInstanceRef.current) {
      chartInstanceRef.current.data.labels = labels;
      chartInstanceRef.current.data.datasets = datasets;
      chartInstanceRef.current.update();
    }

    if (cashChartInstanceRef.current) {
      cashChartInstanceRef.current.data.labels = labels;
      cashChartInstanceRef.current.data.datasets = [
        {
          label: "Balance",
          data: cashBalances,
          borderColor: "#3b82f6",
          backgroundColor: "#3b82f6",
        },
      ];
      cashChartInstanceRef.current.update();
    }

  }, [
    startDate,
    endDate,
    showIncome,
    showExpense,
    selectedAccountId,
    groupBy,
  ]);

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

    (async () => {
      const accList = await accountServices.getAll();
      setAccounts(accList);
      setTotalBalance(accList.reduce((acc, item) => acc + item.balance, 0));
    })();
  }, []);

  useEffect(() => {
    let active = true;
    let intervalParticles = null;

    const initAll = () => {
      if (!chartRef.current || !cashChartRef.current) {
        return false;
      }

      if (!active) return true;

      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
      }

      if (cashChartInstanceRef.current) {
        cashChartInstanceRef.current.destroy();
      }

      chartInstanceRef.current = new Chart(chartRef.current, {
        type: "line",
        data: {
          labels: [],
          datasets: [
            { label: "Income", data: [] },
            { label: "Expense", data: [] },
          ],
        },
        options: {
          responsive: true,
          plugins: {
            legend: { display: false },
          },
          scales: {
            y: {
              ticks: {
                callback(value) {
                  if (value >= 1000000) return `${value / 1000000}M`;
                  if (value >= 1000) return `${value / 1000}K`;
                  return value;
                },
              },
            },
            x: {
              ticks: {
                callback(value) {
                  return this.getLabelForValue(value);
                },
              },
            },
          },
        },
      });

      cashChartInstanceRef.current = new Chart(cashChartRef.current, {
        type: "line",
        data: {
          labels: [],
          datasets: [{ label: "balance", data: [] }],
        },
        options: {
          responsive: true,
          plugins: {
            legend: { display: false },
          },
          scales: {
            y: {
              ticks: {
                callback(value) {
                  if (value >= 1000000) return `${value / 1000000}M`;
                  if (value >= 1000) return `${value / 1000}K`;
                  return value;
                },
              },
            },
            x: {
              ticks: {
                callback(value) {
                  return this.getLabelForValue(value);
                },
              },
            },
          },
        },
      });

      swiperRef.current = new Swiper(".swiper", {
        modules: [Pagination],
        loop: false,
        pagination: {
          el: ".swiper-pagination",
          clickable: true,
        },
      });

      setChartsInitialized(true);

      return true;
    };

    if (!initAll()) {
      const interval = setInterval(() => {
        if (initAll()) {
          clearInterval(interval);
        }
      }, 100);
      return () => {
        active = false;
        clearInterval(interval);
        chartInstanceRef.current?.destroy();
        cashChartInstanceRef.current?.destroy();
        swiperRef.current?.destroy?.(true, true);
      };
    }

    // Dynamic import particles.js
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
      active = false;
      if (intervalParticles) clearInterval(intervalParticles);
      chartInstanceRef.current?.destroy();
      cashChartInstanceRef.current?.destroy();
      swiperRef.current?.destroy?.(true, true);
    };
  }, []);

  useEffect(() => {
    if (chartsInitialized && startDate && endDate) {
      updateCharts();
    }
  }, [chartsInitialized, startDate, endDate, showIncome, showExpense, selectedAccountId, updateCharts]);



  return (
    <main className="relative min-h-screen bg-slate-50">
      <div className="fixed z-10 w-screen nav flex justify-between items-center bg-white p-5 drop-shadow-sm filter">
        <div className="absolute bottom-0" id="particles-js"></div>
        <div>
          <div>
            <p className="text-xs text-gray-500">assets</p>
            <p id="ttl-assets">IDR {myUtils.formatMoney(totalBalance)}</p>
          </div>
          <p className="text-sm whitespace-nowrap" id="dateNow">{dateLabel}</p>
        </div>

        <div className="flex gap-2">
          <Link href="/" className="bg-gray-100 rounded-full drop-shadow-lg w-10 h-10 z-10 flex justify-center items-center text-gray-900">
            <HomeIcon className="w-5 h-5" />
          </Link>
        </div>
      </div>
      <br /><br /><br />
      <br />

      <div className="p-5">
        <div className="swiper">
          <div className="swiper-wrapper">
            <div className="swiper-slide">
              <p className="text-center text-gray-600">in vs ex</p>
              <canvas ref={chartRef} id="myChart"></canvas>
            </div>
            <div className="swiper-slide">
              <p className="text-center text-gray-600">Cash Flow</p>
              <canvas ref={cashChartRef} id="myChartCash"></canvas>
            </div>
          </div>
          <br /><br />
          <div className="swiper-pagination"></div>
        </div>

        <br />

        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <span className="text-sm text-gray-500">Group by</span>
            <div className="flex gap-2" role="group" aria-label="Group transactions by period">
              {[
                { label: "Day", value: "day" },
                { label: "Week", value: "week" },
                { label: "Month", value: "month" },
              ].map((range) => (
                <button
                  key={range.value}
                  type="button"
                  aria-pressed={groupBy === range.value}
                  className={`px-4 py-1.5 rounded-full text-sm border ${
                    groupBy === range.value
                      ? "bg-blue-500 border-blue-500 text-white"
                      : "bg-white border-slate-200 text-slate-700"
                  }`}
                  onClick={() => setGroupBy(range.value)}
                >
                  {range.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-2 flex-wrap items-end">
            <div className="flex flex-col">
              <label htmlFor="start" className="text-sm text-gray-500">start date</label>
              <input type="date" name="start" id="start" className="border px-3 py-1.5 rounded-full text-sm" value={startDate} onChange={(event) => setStartDate(event.target.value)} />
            </div>
            <div className="flex flex-col">
              <label htmlFor="end" className="text-sm text-gray-500">end date</label>
              <input type="date" name="end" id="end" className="border px-3 py-1.5 rounded-full text-sm" value={endDate} onChange={(event) => setEndDate(event.target.value)} />
            </div>
            <div className="flex flex-col min-w-[140px]">
              <label htmlFor="account-filter" className="text-sm text-gray-500">Filter Account</label>
              <select
                id="account-filter"
                className="border px-3 py-1.5 rounded-full text-sm bg-white focus:outline-none h-[34px]"
                value={selectedAccountId}
                onChange={(event) => setSelectedAccountId(event.target.value)}
              >
                <option value="">All Accounts</option>
                {accounts.map((acc) => (
                  <option key={acc.id} value={acc.id}>
                    {acc.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex gap-4 text-sm">
            <label className="flex gap-2">
              <div className="w-4 h-4 flex justify-center items-center rounded-full bg-green-100 text-green-900">
                <ArrowUp className="w-3 h-3" />
              </div>
              <input type="checkbox" id="cb-income" checked={showIncome} onChange={(event) => setShowIncome(event.target.checked)} />
            </label>

            <label className="flex gap-2">
              <div className="w-4 h-4 flex justify-center items-center rounded-full bg-red-100 text-red-900">
                <ArrowDown className="w-3 h-3" />
              </div>
              <input type="checkbox" id="cb-expense" checked={showExpense} onChange={(event) => setShowExpense(event.target.checked)} />
            </label>
          </div>

          <button className="px-4 py-0.5 bg-blue-400 rounded-full text-white" id="submit-data" onClick={updateCharts}>submit</button>
        </div>
      </div>
    </main>
  );
}