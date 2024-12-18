import { Pagination } from "antd";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import Skeleton from "react-loading-skeleton";
import { useSelector } from "react-redux";
import { useFetchEvents } from "../../api/services/eventServices";
import { useGetOrderListByUserId } from "../../api/services/orderServices";
import Empty from "../../assets/Empty.svg";
import Footer from "../../components/common/footer";
import Header from "../../components/common/header";
import SectionTitle from "../../components/common/section-title";
import HelmetHeader from "../../components/helmet";
import SearchTicketBox from "../../components/searchbox-ticket";
import { useHandleClickOutside } from "../../hooks/useHandleClickOutside";
import { userInfoSelector } from "../../redux/slices/accountSlice";
import { ticketSearchListSelector } from "../../redux/slices/generalSlice";
import { isEmpty, isNotEmpty } from "../../utils/utils";
import PurchaseTicketItem from "./purchased-ticket-item";
const PurchasedTickets = () => {
  const user = useSelector(userInfoSelector);
  const ticketSearchList = useSelector(ticketSearchListSelector);
  const { data: tickets, status, isLoading } = useGetOrderListByUserId(user.id);
  const { data: allEvents, status: allEventsStatus } = useFetchEvents();

  const ticketListWithEventName = tickets?.map((ticket) => {
    const { idEvent, ...rest } = ticket;
    const event = isNotEmpty(allEvents) ? allEvents?.find((event) => event.id === idEvent) : null;
    const name = event?.name || '';
    return { idEvent, eventName: name, ...rest };
  }) || [];

  const [currentPage, setCurrentPage] = useState(0);
  
  const onChange = (page) => {
    setCurrentPage(page - 1);
  };

  const firstIndex = currentPage * 3;
  const lastIndex = (currentPage + 1) * 3;
  const { t } = useTranslation();

  useEffect(() => {
    setCurrentPage(0);
  }, [ticketSearchList]);

  // Sửa đổi cách xử lý dữ liệu tìm kiếm
  const displayedTickets = React.useMemo(() => {
    if (isLoading) {
      return null;
    }


    let tickets;
    if (ticketSearchList && ticketSearchList.length > 0) {
      tickets = ticketSearchList.map(searchResult => {
        const originalTicket = ticketListWithEventName.find(
          ticket => ticket.id === searchResult.item.id
        );
        return originalTicket || null;
      }).filter(Boolean);
    } else {
      tickets = ticketListWithEventName;
    }

    // Sắp xếp theo thời gian mua (createdDate) mới nhất lên đầu
    return tickets.sort((a, b) => {
      const dateA = new Date(a.createdDate);
      const dateB = new Date(b.createdDate);
      return dateB - dateA; // Sắp xếp giảm dần (mới nhất lên đầu)
    });

  }, [ticketSearchList, ticketListWithEventName, isLoading]);

  // Log để debug

  return (
    <div className="bg-[#dedede]">
      <HelmetHeader title={t("user.my-ticket")} />
      <Header />
      <div className="w-screen h-full min-h-[60vh]">
        <div className="mx-auto w-full">
          <SectionTitle>{t("user.my-ticket")}</SectionTitle>
          <div className="flex justify-center w-full mx-4">
            <SearchTicketBox
              data={ticketListWithEventName}
              placeholder={t("ticket.placeholder-searchbox")}
            />
          </div>
          <div className="px-8 my-4 w-full h-full block">
            {status === "loading" ? (
              [...Array(3)].map((_, i) => (
                <Skeleton key={i} style={{ height: 400, width: "100%" }} />
              ))
            ) : displayedTickets?.length > 0 ? (
              displayedTickets
                .slice(firstIndex, lastIndex)
                .map((ticket) => 
                  ticket ? ( // Thêm kiểm tra null/undefined
                    <PurchaseTicketItem 
                      key={ticket.id} 
                      data={ticket} 
                    />
                  ) : null
                )
            ) : (
              <div className="w-auto flex justify-center items-center flex-col mb-5">
                <img
                  src={Empty}
                  className="w-[20rem] h-[20rem]"
                  alt="empty"
                  href="https://storyset.com/web"
                />
                <span className="text-3xl font-semibold mb-2">
                  {t("ticket.not-found")}
                </span>
              </div>
            )}
            
            {displayedTickets?.length > 0 && (
              <Pagination
                current={currentPage + 1}
                onChange={onChange}
                total={displayedTickets.length}
                pageSize={3}
                defaultCurrent={1}
              />
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default PurchasedTickets;
