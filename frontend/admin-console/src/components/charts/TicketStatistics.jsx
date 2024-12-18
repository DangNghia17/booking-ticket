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
import { Bar } from "react-chartjs-2";
import {
  getDailyTicketStatistics,
  getLastFourWeeksTicketStatistics,
  getMonthlyTicketStatistics,
} from "../../api/services/orderServices";
import { Spin } from "antd";
import { useQuery } from "@tanstack/react-query";
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
export function TicketStatistics({ organizationEmail, chartName }) {
  const [period, setPeriod] = useState("daily");
  const handlePeriodChange = async (event) => {
    setPeriod(event.target.value);
    // Reset the start and end dates when period changes
  };
  const options = {
    responsive: true,
    maintainAspectRatio: false,
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
        usePointStyle: true
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
          stepSize: 1
        }
      }
    },
    elements: {
      bar: {
        backgroundColor: '#1F3E82',
        borderRadius: 4,
        hoverBackgroundColor: '#2563eb'
      }
    }
  };
  const {
    isLoading,
    data: ticketStatistics,
    refetch,
  } = useQuery(["ticketStatistics", organizationEmail, period], async () => {
    switch (period) {
      case "daily":
        return getDailyTicketStatistics(organizationEmail);
      case "weekly":
        return getLastFourWeeksTicketStatistics(organizationEmail);
      case "monthly":
        return getMonthlyTicketStatistics(organizationEmail);
      default:
        return null;
    }
  });
  useEffect(() => {
    refetch();
  }, [organizationEmail, period, refetch]);
  return (
    <div className="relative h-[400px]">
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
      </div>
      {isLoading ? (
        <div className="w-full h-[300px] animate-pulse bg-gray-100 rounded-lg">
          <Spin />
        </div>
      ) : (
        <div className="w-full h-[300px]">
          {ticketStatistics && (
            <Bar
              data={{
                labels:
                  ticketStatistics.map((dataPoint) => dataPoint.date) ?? [],
                datasets: [
                  {
                    label: t("stats.numTickets"),
                    data:
                      ticketStatistics.map(
                        (dataPoint) => dataPoint.numberTickets
                      ) ?? [],
                    backgroundColor: "#1F3E82",
                  },
                ],
              }}
              options={options}
            />
          )}
        </div>
      )}
    </div>
  );
}
