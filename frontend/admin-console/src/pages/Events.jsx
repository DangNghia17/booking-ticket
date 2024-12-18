import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useFetchEventsByOrgID } from "../api/services/organizationServices";
import { Header } from "../components";
// import for table
import { BsSearchHeart } from "react-icons/bs";
import { Spin, Input, Button, Space } from "antd";
import Highlighter from "react-highlight-words";
import { useRef } from "react";
import { useState } from "react";
// end import for table
import Table from "../components/Table";
import { eventColumns } from "../data/dummy";
import { userInfoSelector } from "../redux/slices/accountSlice";
import {
  convertToCommaSeparatedString,
  getCurrentDatetime,
  reverseArray,
} from "../utils/utils";
import ExportExcelButton from "../components/common/excel-button";
import {
  previewEventSelector,
  eventIdSelector,
  setPreviewEvent,
} from "../redux/slices/eventSlice";
import PreviewEventModal from "../components/common/preview-event-modal";
const Events = () => {
  const user = useSelector(userInfoSelector);
  
  
  const { data: events, isLoading } = useFetchEventsByOrgID(
    user?.id ? user.id : null
  );
  const previewEvent = useSelector(previewEventSelector);
  const eventId = useSelector(eventIdSelector);
  const dispatch = useDispatch();
  console.log({ events });
  const { t } = useTranslation();
  const navigate = useNavigate();
  const eventData = Array.isArray(events) ? events.map(event => ({
    ...event,
    eventCategoryList: event.eventCategoryList || [],
  })) : [];
  const closeModal = () => {
    dispatch(setPreviewEvent(false));
  };

  // for table
  const [searchText, setSearchText] = useState("");
  const [searchedColumn, setSearchedColumn] = useState("");
  const searchInput = useRef(null);
  const handleSearch = (selectedKeys, confirm, dataIndex) => {
    confirm();
    setSearchText(selectedKeys[0]);
    setSearchedColumn(dataIndex);
  };
  const handleReset = (clearFilters) => {
    clearFilters();
    setSearchText("");
  };
  const getColumnSearchProps = (dataIndex) => ({
    filterDropdown: ({
      setSelectedKeys,
      selectedKeys,
      confirm,
      clearFilters,
      close,
    }) => (
      <div
        style={{
          padding: 8,
        }}
        onKeyDown={(e) => e.stopPropagation()}
      >
        <Input
          ref={searchInput}
          placeholder={`Search ${dataIndex}`}
          value={selectedKeys[0]}
          onChange={(e) =>
            setSelectedKeys(e.target.value ? [e.target.value] : [])
          }
          onPressEnter={() => handleSearch(selectedKeys, confirm, dataIndex)}
          style={{
            marginBottom: 8,
            display: "block",
          }}
        />
        <Space>
          <Button
            type="primary"
            onClick={() => handleSearch(selectedKeys, confirm, dataIndex)}
            // icon={<BsSearchHeart />}
            size="small"
            style={{
              width: 140,
            }}
          >
            Search
          </Button>
          <Button
            onClick={() => clearFilters && handleReset(clearFilters)}
            size="small"
            style={{
              width: 90,
            }}
          >
            Reset
          </Button>
          <Button
            type="link"
            size="small"
            onClick={() => {
              confirm({
                closeDropdown: false,
              });
              setSearchText(selectedKeys[0]);
              setSearchedColumn(dataIndex);
            }}
          >
            Filter
          </Button>
          <Button
            type="link"
            size="small"
            onClick={() => {
              close();
            }}
          >
            close
          </Button>
        </Space>
      </div>
    ),
    filterIcon: (filtered) => (
      <BsSearchHeart
        style={{
          color: filtered ? "#1890ff" : undefined,
        }}
      />
    ),
    onFilter: (value, record) =>
      record[dataIndex].toString().toLowerCase().includes(value.toLowerCase()),
    onFilterDropdownOpenChange: (visible) => {
      if (visible) {
        setTimeout(() => searchInput.current?.select(), 100);
      }
    },
    render: (text) =>
      searchedColumn === dataIndex ? (
        <Highlighter
          highlightStyle={{
            backgroundColor: "#ffc069",
            padding: 0,
          }}
          searchWords={[searchText]}
          autoEscape
          textToHighlight={text ? text.toString() : ""}
        />
      ) : (
        text
      ),
  });
  // columns for Excel
  const columns = [
    { header: "Name", key: "name", width: 32 },
    { header: "Categories", key: "categories", width: 32, outlineLevel: 1 },
    { header: "Date", key: "date", width: 15 },
    { header: "Status", key: "status", width: 10 },
  ];
  const eventDataForExcel = eventData?.map((item) => ({
    name: item.name || '',
    categories: item.categories && Array.isArray(item.categories) 
      ? item.categories
          .map(cat => cat?.name ? t(cat.name) : '')
          .filter(Boolean)
          .join(', ')
      : '',
    date: item.date || '',
    status: item.status === "event.completed"
      ? t("event.status.completed")
      : t("event.status.available"),
  }));
  // end for table
  const nameColumn = eventColumns.find((e) => e.dataIndex === "name");
  Object.assign(nameColumn, getColumnSearchProps("name"));

  // Nếu không có user.id, có thể redirect về trang login
  useEffect(() => {
    if (!user?.id) {
      // Redirect to login
      navigate('/login');
    }
  }, [user]);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mb-8">
        <Header category={t("sider.management")} title={t("sider.event")} />
        
        <div className="flex justify-end gap-4 mt-4">
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 
                     transition-colors duration-200 flex items-center gap-2 shadow-md hover:shadow-lg"
            onClick={() => navigate("/event/create")}
          >
            <span className="text-lg">+</span>
            {t("event.create")}
          </button>
          
          <ExportExcelButton
            data={eventDataForExcel}
            columns={columns}
            filename={`Event-${getCurrentDatetime()}`}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 
                      transition-colors duration-200 flex items-center gap-2 shadow-md hover:shadow-lg"
          />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg border border-gray-200">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <Spin size="large" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table
              columns={eventColumns}
              dataSource={reverseArray(eventData)}
              rowKey={(record) => record.id}
              className="w-full"
              pagination={{
                className: "px-6 py-4 bg-gray-50 border-t border-gray-200",
                showSizeChanger: true,
                showTotal: (total) => `Tổng ${total} sự kiện`,
                pageSize: 10,
                position: ["bottomRight"],
              }}
              rowClassName={(record, index) => 
                `${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} 
                 hover:bg-blue-50 transition-all duration-200`
              }
              onRow={(record) => ({
                className: 'border-b border-gray-200'
              })}
              components={{
                header: {
                  cell: props => (
                    <th
                      {...props}
                      className="bg-gray-100 text-gray-700 font-semibold py-4 px-6 text-left border-b border-gray-200"
                    />
                  ),
                },
                body: {
                  cell: props => (
                    <td
                      {...props}
                      className="py-4 px-6 text-gray-600"
                    />
                  ),
                },
              }}
            />
          </div>
        )}
      </div>

      <PreviewEventModal
        visible={previewEvent}
        onCancel={closeModal}
        eventId={eventId}
      />
    </div>
  );
};
export default Events;
