import { Modal } from "antd";
import { filter, sortBy, some } from "lodash";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import { useFetchCategories } from "../api/services/categoryServices";
import { useFetchEvents } from "../api/services/eventServices";
import { Header } from "../components";
import CategoryItem from "../components/CategoryItem";
import Table from "../components/Table";
import EventsByCategoryChart from "../components/charts/EventsByCategoryChart";
import { eventByCategoryColumns } from "../data/dummy";
import {
  setShowCategoryModal,
  showCategorySelection,
} from "../redux/slices/categorySlice";

const Categories = () => {
  const { data: categories, status } = useFetchCategories();
  const [category, setCategory] = useState(null);
  const { data: events, status: eventStatus } = useFetchEvents();
  const eventData = events?.map((item) => ({
    id: item.id,
    background: item.background,
    name: item.name,
    categories: item.eventCategoryList,
    date: item.startingDate,
    status: item.status,
  }));
  const open = useSelector(showCategorySelection);
  const [eventsByCategory, setEventsByCategory] = useState([]);
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const findEventsByCategoryName = (events, categoryName) =>
    filter(events, (event) => event.categories.includes(categoryName));

  useEffect(() => {
    const eventsByCat = findEventsByCategoryName(eventData, category);
    setEventsByCategory(eventsByCat);
  }, [category]);
  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="mb-6">
        <p className="text-sm font-medium text-gray-500/80 uppercase tracking-wider mb-2">
          {t("sider.management")}
        </p>
        <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 
                       bg-clip-text text-transparent">
          {t("sider.category")}
        </h1>
      </div>
      <div className="bg-white rounded-xl border border-gray-100/50 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories?.map((categoryName, index) => (
            <CategoryItem
              category={{ name: categoryName }}
              icon={categoryName}
              onClick={() => {
                setCategory(categoryName);
                dispatch(setShowCategoryModal(true));
              }}
              key={index}
            />
          ))}
        </div>
      </div>
      <Modal
        title={t(category || '')}
        visible={open}
        width={"80vw"}
        closable={false}
        onCancel={() => dispatch(setShowCategoryModal(false))}
        onOk={() => dispatch(setShowCategoryModal(false))}
      >
        <Table
          dataSource={
            eventStatus === "success" &&
            sortBy(eventsByCategory, (event) => {
              if (event.status === "event.available") {
                return 1;
              } else if (event.status === "event.completed") {
                return 2;
              }
              // Handle other cases if needed
            })
          }
          columns={eventByCategoryColumns}
        />
      </Modal>
    </div>
  );
};
export default Categories;
