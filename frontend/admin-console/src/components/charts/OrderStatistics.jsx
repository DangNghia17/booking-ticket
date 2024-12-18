import {
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LineElement,
  LinearScale,
  BarElement,
  PointElement,
  Title,
  Tooltip,
} from "chart.js";
import { t } from "i18next";
import { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import {
  getDailyOrderStatistics,
  getLastFourWeeksOrderStatistics,
  getMonthlyOrderStatistics,
} from "../../api/services/orderServices";
import { Spin } from "antd";
import { useQuery } from "@tanstack/react-query";
import theme from "../../shared/theme";
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);
export function OrderStatistics({ organizationEmail, chartName }) {
  const [period, setPeriod] = useState("daily");
  const [currency, setCurrency] = useState("VND");
  const handlePeriodChange = async (event) => {
    setPeriod(event.target.value);
    // Reset the start and end dates when period changes
  };
  const handleCurrencyChange = async (event) => {
    setCurrency(event.target.value);
  };
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        backgroundColor: 'white',
        titleColor: '#111827',
        bodyColor: '#111827',
        borderColor: '#e5e7eb',
        borderWidth: 1,
        padding: 12,
        boxPadding: 6,
        usePointStyle: true,
        callbacks: {
          label: function(context) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              label += new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: currency
              }).format(context.parsed.y);
            }
            return label;
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          font: {
            size: 12,
          },
          color: '#6b7280'
        }
      },
      y: {
        grid: {
          color: '#f3f4f6',
        },
        ticks: {
          font: {
            size: 12,
          },
          color: '#6b7280',
          callback: function(value) {
            if (value >= 1000000) {
              return (value / 1000000).toFixed(1) + 'M';
            }
            return value;
          }
        }
      }
    },
    elements: {
      line: {
        tension: 0.4,
        borderWidth: 2,
        borderColor: currency === 'VND' ? '#1F3E82' : '#ef4444',
        fill: true,
        backgroundColor: currency === 'VND' ? 'rgba(31, 62, 130, 0.1)' : 'rgba(239, 68, 68, 0.1)',
      },
      point: {
        radius: 0,
        hitRadius: 10,
        hoverRadius: 4,
        hoverBorderWidth: 2,
      }
    }
  };
  const {
    isLoading,
    data: orderStatistics,
    refetch,
  } = useQuery(["orderStatistics", organizationEmail, period], async () => {
    switch (period) {
      case "daily":
        return getDailyOrderStatistics(organizationEmail);
      case "weekly":
        return getLastFourWeeksOrderStatistics(organizationEmail);
      case "monthly":
        return getMonthlyOrderStatistics(organizationEmail);
      default:
        return null;
    }
  });
  useEffect(() => {
    refetch();
  }, [organizationEmail, period, refetch]);
  return (
    <div className="relative h-[400px]">
      <h2 className="text-xl font-bold mb-4">{t(chartName)}</h2>
      <div className="flex flex-col sm:flex-row items-center gap-4 mb-6">
        <div className="flex items-center gap-2">
          <label htmlFor="period" className="text-sm font-medium text-gray-600">
            {t("stats.period")}
          </label>
          <select
            id="period"
            className="rounded-lg px-3 py-1.5 border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/30"
            value={period}
            onChange={handlePeriodChange}
          >
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <label htmlFor="currency" className="text-sm font-medium text-gray-600">
            {t("event.currency")}
          </label>
          <select
            className="rounded-lg px-3 py-1.5 border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/30"
            value={currency}
            onChange={handleCurrencyChange}
          >
            <option value="USD">USD</option>
            <option value="VND">VND</option>
          </select>
        </div>
      </div>
      {isLoading ? (
        <div className="w-full h-[300px] animate-pulse bg-gray-100 rounded-lg">
          <Spin />
        </div>
      ) : (
        <div className="w-full h-[300px]">
          {orderStatistics && (
            <div>
              {currency === "VND" ? (
                <Line
                  data={{
                    labels:
                      orderStatistics.map((dataPoint) => dataPoint.date) ?? [],
                    datasets: [
                      {
                        label: "VND",
                        data:
                          orderStatistics.map(
                            (dataPoint) => dataPoint.orderTotalPriceByVND
                          ) ?? [],
                        borderColor: theme.main,
                        fill: true,
                      },
                    ],
                  }}
                  options={options}
                />
              ) : (
                <Line
                  data={{
                    labels:
                      orderStatistics.map((dataPoint) => dataPoint.date) ?? [],
                    datasets: [
                      {
                        label: "USD",
                        data:
                          orderStatistics.map(
                            (dataPoint) => dataPoint.orderTotalPriceByUSD
                          ) ?? [],
                        borderColor: "red",
                        fill: false,
                      },
                    ],
                  }}
                  options={options}
                />
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
