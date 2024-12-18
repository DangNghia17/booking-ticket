/* eslint-disable react-hooks/exhaustive-deps */
import { Tooltip } from "antd";
import moment from "moment";
import React, { useEffect } from "react";
import Skeleton from "@mui/material/Skeleton";
import { BiMoney } from "react-icons/bi";
import {
  BsCalendarEventFill,
  BsCaretDownFill,
  BsCaretUpFill,
  BsCartFill,
} from "react-icons/bs";
import { IoTicketSharp } from "react-icons/io5";
import { useDispatch, useSelector } from "react-redux";
import { useGetStatisticByID } from "../api/services/organizationServices";
import { TicketStatistics } from "../components/charts/TicketStatistics";
import { OrderStatistics } from "../components/charts/OrderStatistics";
import { roleSelector, userInfoSelector } from "../redux/slices/accountSlice";
import {
  setEventStats,
  setOrderStats,
  setRevenueStats,
  setTicketStats,
} from "../redux/slices/statisticSlice";
import { Greeting, formatter, nFormatter } from "../utils/utils";
import { useTranslation } from "react-i18next";

const Overview = () => {
  const user = useSelector(userInfoSelector);
  const role = useSelector(roleSelector);
  const { data, status, isLoading } = useGetStatisticByID(user.email);
  const dispatch = useDispatch();
  const today = moment().format("DD/MM/YYYY");
  const randomDay = moment("29/12/2022", "DD/MM/YYYY").format("DD/MM/YYYY");
  const greeting = Greeting();
  const { t } = useTranslation();
  useEffect(() => {
    if (status === "success") {
      dispatch(
        setEventStats({
          date: today,
          eventQuantity: data.numEvents,
        })
      );
      dispatch(
        setTicketStats({
          date: today,
          ticketQuantity: data.numTickets,
        })
      );
      dispatch(
        setOrderStats({
          date: today,
          orderQuantity: data.numOrders,
        })
      );
      dispatch(
        setRevenueStats({
          date: randomDay,
          revenue: data.revenue,
        })
      );
    }
  }, [data]);
  const handleVariability = (variability, stateQuantity) => {
    if (variability < 0) {
      return { status: "-", variability, color: "red" };
    } else if (variability > 0) {
      return { status: "+", variability, color: "green" };
    } else {
      return { status: "", variability: "", color: "" };
    }
  };
  if (status === "success") {
    var earningData = [
      {
        icon: <BsCalendarEventFill />,
        amount: data.numEvents,
        rawAmount: data.numEvents,
        variability: handleVariability(data.eventsSizeChange, "eventQuantity")
          .variability,
        title: t("sider.event"),
        iconColor: "#03C9D7",
        iconBg: "#E5FAFB",
        pcColor: handleVariability(data.eventsSizeChange, "eventQuantity")
          .color,
      },
      {
        icon: <IoTicketSharp />,
        amount: data.numTickets,
        rawAmount: data.numTickets,
        // variability: handleVariability(data.eventsSizeChange, "ticketQuantity")
        //   .variability,
        title: t("ticketSold"),
        iconColor: "rgb(0, 148, 91)",
        iconBg: "#b2ebd5",
        // pcColor: handleVariability(ticketStats, "ticketQuantity").color,
      },
      {
        icon: <BsCartFill />,
        amount: data.numOrders,
        rawAmount: data.numOrders,
        variability: handleVariability(data.ordersSizeChange, "orderQuantity")
          .variability,
        title: t("sider.order"),
        iconColor: "rgb(255, 244, 229)",
        iconBg: "rgb(254, 201, 15)",
        pcColor: handleVariability(data.ordersSizeChange, "orderQuantity")
          .color,
      },
      {
        icon: <BiMoney />,
        amount: `$${nFormatter(data.revenueUSD, 2)}`,
        rawAmount: formatter("USD").format(data.revenueUSD),
        // variability: handleVariability(revenueStats, "revenue").variability
        //   ? `$${nFormatter(
        //       handleVariability(revenueStats, "revenue").variability,
        //       2
        //     )}`
        //   : "",
        title: t("usdRevenue"),
        iconColor: "rgb(228, 106, 118)",
        iconBg: "rgb(255, 244, 229)",
        // pcColor: handleVariability(revenueStats, "revenue").color,
      },
      {
        icon: <BiMoney />,
        amount: `${nFormatter(data.revenueVND, 2)}`,
        rawAmount: formatter("VND").format(data.revenueVND),
        // variability: handleVariability(revenueStats, "revenue").variability
        //   ? `$${nFormatter(
        //       handleVariability(revenueStats, "revenue").variability,
        //       2
        //     )}`
        //   : "",
        title: t("vndRevenue"),
        iconColor: "rgb(228, 106, 118)",
        iconBg: "rgb(255, 244, 229)",
        // pcColor: handleVariability(revenueStats, "revenue").color,
      },
    ];
  }
  return (
    <div className="p-6 bg-gray-50">
      <h1 className="px-8 mb-6">
        <p className="text-2xl text-gray-500 mb-2">{t(greeting)}</p>
        <p className="text-3xl text-[#1F3E82] font-bold">{user.name}</p>
      </h1>
      <div className="grid grid-cols-5 items-center gap-4 px-8 mb-8">
        {isLoading
          ? [...Array(5)].map((_, index) => (
              <Skeleton key={`skeleton-${index}`} variant="rectangular" height={140} className="rounded-xl" />
            ))
          : earningData.map((item) => (
              <div
                key={item.title}
                className="bg-white rounded-xl p-6 border border-gray-100 hover:border-blue-100 
                            transition-all duration-300 ease-in-out transform hover:-translate-y-1 
                            hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative group"
              >
                <div className="absolute top-4 right-4 bg-gradient-to-r from-blue-50 to-blue-100/50 
                                p-2 rounded-lg group-hover:scale-110 transition-transform duration-300">
                  <span className="text-2xl text-blue-600">{item.icon}</span>
                </div>
                <div className="space-y-4">
                  <p className="text-sm font-medium text-gray-500/80 uppercase tracking-wider">
                    {item.title}
                  </p>
                  <div className="flex items-end gap-x-4">
                    <Tooltip
                      placement="rightBottom"
                      title={
                        <span className="text-2xl font-bold">
                          {item.rawAmount}
                        </span>
                      }
                    >
                      <span className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 
                                    bg-clip-text text-transparent">{item.amount}</span>
                    </Tooltip>
                    <span
                      className="text-sm font-medium flex items-center gap-1 px-2 py-1 rounded-full
                                transition-colors duration-200"
                      style={{ 
                        backgroundColor: item.pcColor === 'red' ? 'rgb(254,226,226)' : 
                                          item.pcColor === 'green' ? 'rgb(220,252,231)' : 'transparent',
                        color: item.pcColor === 'red' ? 'rgb(220,38,38)' : 
                                          item.pcColor === 'green' ? 'rgb(22,163,74)' : 'currentColor'
                      }}
                    >
                      {item.pcColor === "red" ? (
                        <BsCaretDownFill />
                      ) : item.pcColor === "green" ? (
                        <BsCaretUpFill />
                      ) : null}
                      <span>{item.variability}</span>
                    </span>
                  </div>
                </div>
              </div>
            ))}
      </div>
      <div className="grid grid-cols-2 gap-6 px-8">
        {role !== "ROLE_ADMIN" && (
          <div className="bg-white rounded-xl border border-gray-100/50 p-6">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-800">{t("stats.ticket")}</h3>
              <p className="text-sm text-gray-500">Thống kê vé đã bán theo thời gian</p>
            </div>
            <TicketStatistics
              organizationEmail={user.email}
              chartName="stats.ticket"
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'top',
                    labels: {
                      usePointStyle: true,
                      padding: 20,
                      font: {
                        family: "'Inter', sans-serif",
                        size: 12
                      }
                    }
                  }
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    grid: {
                      color: 'rgba(0, 0, 0, 0.05)',
                      drawBorder: false
                    },
                    ticks: {
                      font: {
                        family: "'Inter', sans-serif",
                        size: 11
                      }
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
                      }
                    }
                  }
                }
              }}
            />
          </div>
        )}
        {role !== "ROLE_ADMIN" && (
          <div className="bg-white rounded-xl border border-gray-100/50 p-6">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-800">{t("stats.order")}</h3>
              <p className="text-sm text-gray-500">Thống kê đơn hàng theo thời gian</p>
            </div>
            <OrderStatistics
              organizationEmail={user.email}
              chartName="stats.order"
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'top',
                    labels: {
                      usePointStyle: true,
                      padding: 20,
                      font: {
                        family: "'Inter', sans-serif",
                        size: 12
                      }
                    }
                  }
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    grid: {
                      color: 'rgba(0, 0, 0, 0.05)',
                      drawBorder: false
                    },
                    ticks: {
                      font: {
                        family: "'Inter', sans-serif",
                        size: 11
                      }
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
                      }
                    }
                  }
                }
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default Overview;
