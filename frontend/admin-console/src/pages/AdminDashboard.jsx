import { Tooltip } from "antd";
import React from "react";
import { useTranslation } from "react-i18next";
import { BiMoney } from "react-icons/bi";
import { BsCaretDownFill, BsCaretUpFill } from "react-icons/bs";
import { useSelector } from "react-redux";
import {
  useFindAllAccount,
  useGetAdminProfile,
} from "../api/services/adminServices";
import { filter } from "lodash";
import { userInfoSelector } from "../redux/slices/accountSlice";
import { Greeting, formatter, nFormatter } from "../utils/utils";
import { ROLE } from "../utils/constants";
import PieChart from "../components/charts/PieChart";
import { useFetchEvents } from "../api/services/eventServices";
import EventsByCategoryChart from "../components/charts/EventsByCategoryChart";
import theme from "../shared/theme";
function AdminDashboard() {
  const user = useSelector(userInfoSelector);
  const { t } = useTranslation();
  const { data: AdminProfile, status: AdminStatus } = useGetAdminProfile(
    user.email
  );
  const { data: accounts, status: accountStatus } = useFindAllAccount();
  const { data: events, status: eventStatus } = useFetchEvents();

  // count number of events by province
  const hochiminhCount = filter(events, { province: "Thành phố Hồ Chí Minh" }).length;
  const hanoiCount = filter(events, { province: "Hà Nội" }).length;
  const lamdongCount = filter(events, { province: "Lâm Đồng" }).length;
  const otherCount = filter(events, function (o) {
    return (
      o.province !== "Thành phố Hồ Chí Minh" &&
      o.province !== "Hà Nội" &&
      o.province !== "Lâm Đồng"
    );
  }).length;
  const eventData = {
    labels: [
      t("province.hcm"),
      t("province.hn"),
      t("province.ld"),
      t("province.others"),
    ],
    datasets: [
      {
        data: [hochiminhCount, hanoiCount, lamdongCount, otherCount],
        backgroundColor: [
          'rgba(147, 197, 253, 0.8)',
          'rgba(252, 165, 165, 0.8)',
          'rgba(167, 243, 208, 0.8)',
          'rgba(253, 230, 138, 0.8)',
        ],
        hoverBackgroundColor: [
          'rgba(147, 197, 253, 1)',
          'rgba(252, 165, 165, 1)',
          'rgba(167, 243, 208, 1)',
          'rgba(253, 230, 138, 1)',
        ],
        borderWidth: 2,
      },
    ],
  };
  const pieOptions = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        labels: {
          font: {
            size: 20, // Adjust the font size as desired
          },
        },
        position: "right",
      },
    },
    tooltips: {
      callbacks: {
        label: (tooltipItem, data) => {
          const dataset = data.datasets[tooltipItem.datasetIndex];
          const total = dataset.data.reduce(
            (accumulator, currentValue) => accumulator + currentValue
          );
          const value = dataset.data[tooltipItem.index];
          const percentage = ((value / total) * 100).toFixed(2);
          return `${dataset.label}: ${percentage}%`;
        },
      },
    },
  };
  // count number of accounts by role
  const userCount = filter(accounts, { role: ROLE.Customer }).length;
  const organizerCount = filter(accounts, { role: ROLE.Organizer }).length;
  const adminCount = filter(accounts, { role: ROLE.Admin }).length;

  const accountData = {
    labels: [t("role.user"), t("role.organizer"), t("role.admin")],
    datasets: [
      {
        data: [userCount, organizerCount, adminCount],
        backgroundColor: [
          'rgba(99, 179, 237, 0.8)',
          'rgba(246, 173, 85, 0.8)',
          'rgba(104, 211, 145, 0.8)',
        ],
        hoverBackgroundColor: [
          'rgba(99, 179, 237, 1)',
          'rgba(246, 173, 85, 1)',
          'rgba(104, 211, 145, 1)',
        ],
        borderWidth: 2,
      },
    ],
  };
  const greeting = Greeting();
  if (AdminStatus === "success") {
    var earningData = [
      {
        icon: <BiMoney />,
        amount: `$${nFormatter(AdminProfile.usdbalance, 2)}`,
        rawAmount: formatter("USD").format(AdminProfile.usdbalance),
        title: t("usdbalance"),
        iconColor: "rgb(228, 106, 118)",
        iconBg: "rgb(255, 244, 229)",
      },
      {
        icon: <BiMoney />,
        amount: `${nFormatter(AdminProfile.vndbalance, 2)}`,
        rawAmount: formatter("VND").format(AdminProfile.vndbalance),
        title: t("vndbalance"),
        iconColor: "rgb(228, 106, 118)",
        iconBg: "rgb(255, 244, 229)",
      },
      {
        icon: <BiMoney />,
        amount: `$${nFormatter(AdminProfile.usdbalanceLock, 2)}`,
        rawAmount: formatter("USD").format(AdminProfile.usdbalanceLock),
        title: t("usdbalanceLock"),
        iconColor: "rgb(228, 106, 118)",
        iconBg: "rgb(255, 244, 229)",
      },
      {
        icon: <BiMoney />,
        amount: `${nFormatter(AdminProfile.vndbalanceLock, 2)}`,
        rawAmount: formatter("VND").format(AdminProfile.vndbalanceLock),
        title: t("vndbalanceLock"),
        iconColor: "rgb(228, 106, 118)",
        iconBg: "rgb(255, 244, 229)",
      },
    ];
  }
  return (
    <div className="p-6 bg-gray-50">
      <h1 className="px-8 mb-6">
        <p className="text-2xl text-gray-500 mb-2">{t(greeting)}</p>
        <p className="text-3xl text-[#1F3E82] font-bold">{user.name}</p>
      </h1>
      <div className="grid grid-cols-4 items-center gap-4 px-8 mb-8">
        {AdminStatus === "success" &&
          earningData.map((item, index) => (
            <div
              key={index}
              className="bg-white rounded-xl p-6 border border-gray-100/50 hover:border-blue-100 
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
                <div className="flex items-end gap-x-2">
                  <Tooltip
                    placement="rightBottom"
                    title={
                      <span className="text-2xl font-bold">{item.rawAmount}</span>
                    }
                  >
                    <span className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 
                                    bg-clip-text text-transparent">{item.amount}</span>
                  </Tooltip>
                  <span
                    className={`text-sm font-medium flex items-center gap-1 px-2 py-1 rounded-full
                              ${item.pcColor === 'red' ? 'bg-red-100 text-red-600' : 
                                item.pcColor === 'green' ? 'bg-green-100 text-green-600' : ''}`}
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
        {accountStatus === "success" && (
          <div className="bg-white rounded-xl border border-gray-100/50 p-6">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-800">{t("title.account")}</h3>
              <p className="text-sm text-gray-500">Thống kê tài khoản theo vai trò</p>
            </div>
            <PieChart
              data={accountData}
              options={pieOptions}
            />
          </div>
        )}
        {eventStatus === "success" && (
          <div className="bg-white rounded-xl border border-gray-100/50 p-6">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-800">{t("title.event")}</h3>
              <p className="text-sm text-gray-500">Thống kê sự kiện theo tỉnh/tp</p>
            </div>
            <PieChart
              data={eventData}
              options={pieOptions}
            />
          </div>
        )}
      </div>
      <div className="bg-white rounded-xl border border-gray-100/50 p-6 mx-8 mt-6">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-800">{t("title.event")}</h3>
          <p className="text-sm text-gray-500">Thống kê sự kiện theo thể loại</p>
        </div>
        <EventsByCategoryChart events={events} />
      </div>
    </div>
  );
}

export default AdminDashboard;
