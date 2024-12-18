import React from "react";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Pie } from "react-chartjs-2";

ChartJS.register(ArcElement, Tooltip, Legend);

const PieChart = (props) => {
  const { data, options } = props;

  return (
    <div className="w-full h-[300px] relative">
      <Pie 
        data={data} 
        options={{
          ...options,
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            ...options?.plugins,
            legend: {
              position: 'right',
              labels: {
                usePointStyle: true,
                padding: 20,
                font: {
                  family: "'Inter', sans-serif",
                  size: 12,
                  weight: '500'
                },
                color: '#4B5563'
              }
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
              usePointStyle: true,
              callbacks: {
                label: function(context) {
                  const label = context.label || '';
                  const value = context.raw;
                  const total = context.dataset.data.reduce((a, b) => a + b);
                  const percentage = Math.round((value / total) * 100);
                  return `${label}: ${percentage}%`;
                }
              }
            }
          },
          layout: {
            padding: {
              top: 10,
              bottom: 10
            }
          },
          elements: {
            arc: {
              borderWidth: 2,
              borderColor: '#fff',
              hoverBorderColor: '#fff',
              hoverOffset: 8,
              borderRadius: 4,
              hoverBorderWidth: 3,
              transition: 'all 0.3s ease'
            }
          }
        }}
      />
    </div>
  );
};

export default PieChart;
