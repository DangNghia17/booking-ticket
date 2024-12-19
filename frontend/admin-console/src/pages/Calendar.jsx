import React, { useEffect, useState } from 'react';
import { Calendar as AntCalendar, Badge } from 'antd';
import { useTranslation } from "react-i18next";
import { Header } from "../components";
import moment from 'moment';
import { useSelector } from 'react-redux';
import eventServices from '../api/services/eventServices';

const Calendar = () => {
  const { t } = useTranslation();
  const [events, setEvents] = useState([]);
  const user = useSelector((state) => state.account.userInfo);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await eventServices.getEventsByOrganizer(user.id);
        if (response.status === 200) {
          setEvents(response.data);
        }
      } catch (error) {
        console.error("Error fetching events:", error);
      }
    };

    fetchEvents();
  }, [user.id]);

  // Hàm lấy danh sách sự kiện cho ngày cụ thể
  const getListData = (value) => {
    const dateStr = value.format('DD/MM/YYYY');
    return events.filter(event => {
      const eventDate = moment(event.startingDate, 'DD/MM/YYYY').format('DD/MM/YYYY');
      return dateStr === eventDate;
    });
  };

  // Tùy chỉnh hiển thị cho từng ô ngày
  const dateCellRender = (value) => {
    const listData = getListData(value);
    
    return (
      <div className="h-full">
        {listData.map((item) => (
          <div 
            key={item.id}
            className="mb-1 overflow-hidden"
          >
            <Badge 
              status="processing" 
              text={
                <span className="text-xs truncate block">
                  {item.name}
                </span>
              }
              className="w-full"
            />
          </div>
        ))}
      </div>
    );
  };

  // Tùy chỉnh hiển thị khi xem theo tháng
  const monthCellRender = (value) => {
    const month = value.month();
    const year = value.year();
    
    const monthEvents = events.filter(event => {
      const eventDate = moment(event.startingDate, 'DD/MM/YYYY');
      return eventDate.month() === month && eventDate.year() === year;
    });

    return monthEvents.length > 0 ? (
      <div className="text-xs">
        <Badge 
          status="processing" 
          text={`${monthEvents.length} ${t('event.events')}`}
        />
      </div>
    ) : null;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mb-8">
        <Header category={t("sider.utilities")} title={t("sider.calendar")} />
      </div>
      <div className="bg-white rounded-xl shadow-lg p-6">
        <AntCalendar 
          dateCellRender={dateCellRender}
          monthCellRender={monthCellRender}
          className="events-calendar"
        />
      </div>
    </div>
  );
};

export default Calendar; 