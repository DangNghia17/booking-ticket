import React from "react";
import { useTranslation } from "react-i18next";
import { Bar } from "react-chartjs-2";
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

const EventsByCategoryChart = ({ events }) => {
  const { t } = useTranslation();
  // Prepare data for the chart
  const categories = [];
  const eventCounts = [];

  // Count the number of events in each category
  events?.forEach((event) => {
    event.eventCategoryList.forEach((category) => {
      const index = categories.indexOf(t(category.name));
      if (index !== -1) {
        eventCounts[index]++;
      } else {
        categories.push(t(category.name));
        eventCounts.push(1);
      }
    });
  });

  // Define the chart data
  const chartData = {
    labels: categories,
    datasets: [
      {
        label: "Event Count",
        data: eventCounts,
        backgroundColor: [
          'rgba(147, 197, 253, 0.8)',  // Xanh dương nhạt
          'rgba(252, 165, 165, 0.8)',  // Đỏ hồng nhạt
          'rgba(167, 243, 208, 0.8)',  // Mint nhạt
          'rgba(253, 230, 138, 0.8)',  // Vàng nhạt
          'rgba(196, 181, 253, 0.8)',  // Tím nhạt
          'rgba(251, 191, 36, 0.8)',   // Amber nhạt
          'rgba(239, 68, 68, 0.8)',    // Đỏ nhạt
          'rgba(16, 185, 129, 0.8)',   // Xanh lá nhạt
          'rgba(99, 102, 241, 0.8)',   // Indigo nhạt
          'rgba(236, 72, 153, 0.8)',   // Pink nhạt
        ],
        hoverBackgroundColor: [
          'rgba(147, 197, 253, 1)',
          'rgba(252, 165, 165, 1)',
          'rgba(167, 243, 208, 1)',
          'rgba(253, 230, 138, 1)',
          'rgba(196, 181, 253, 1)',
          'rgba(251, 191, 36, 1)',
          'rgba(239, 68, 68, 1)',
          'rgba(16, 185, 129, 1)',
          'rgba(99, 102, 241, 1)',
          'rgba(236, 72, 153, 1)',
        ],
        borderRadius: 6,
        maxBarThickness: 40,
        borderWidth: 2,
        borderColor: 'white',
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    barThickness: 60,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        backgroundColor: 'white',
        titleColor: '#111827',
        bodyColor: '#111827',
        bodyFont: {
          family: "'Inter', sans-serif",
          size: 12
        },
        borderColor: '#e5e7eb',
        borderWidth: 1,
        padding: 12,
        boxPadding: 6,
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        suggestedMax: Math.max(...eventCounts) + 2,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
          drawBorder: false
        },
        ticks: {
          font: {
            family: "'Inter', sans-serif",
            size: 11
          },
          color: '#6B7280'
        }
      },
      x: {
        grid: {
          display: false
        },
        ticks: {
          font: {
            family: "'Inter', sans-serif",
            size: 11
          },
          color: '#6B7280',
          maxRotation: 0,
          padding: 10
        },
        afterFit: (scale) => {
          scale.paddingRight = 20;
          scale.paddingLeft = 20;
        }
      }
    },
    layout: {
      padding: {
        left: 20,
        right: 20,
        top: 20,
        bottom: 20
      }
    }
  };

  return (
    <div className="w-full h-[400px]">
      <Bar 
        data={chartData} 
        options={options}
      />
    </div>
  );
};

export default EventsByCategoryChart;
