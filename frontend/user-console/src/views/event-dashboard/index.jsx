/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect } from "react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import "react-loading-skeleton/dist/skeleton.css";
import { useDispatch, useSelector } from "react-redux";
import { useSearchParams } from "react-router-dom";
import { useFetchCategories } from "../../api/services/categoryServices";
import { useFetchEvents } from "../../api/services/eventServices";
import Header from "../../components/common/header";
import FooterComponent from "../../components/FooterComponent";
import HelmetHeader from "../../components/helmet";
import HeroBanner from "../../components/hero";
import HomeDrawer from "../../components/home-drawer";
import { setCategoryId } from "../../redux/slices/filterSlice";
import { setPathName } from "../../redux/slices/routeSlice";
import { resultsSelector } from "../../redux/slices/searchSlice";
import { isEmpty } from "../../utils/utils";
import FilterEventFragment from "./filterEvent/index";
import SearchResults from "./searchResults";
import Loading from "../../components/loading";
function EventDashBoard() {
  const { t } = useTranslation();
  // eslint-disable-next-line no-unused-vars
  const [categoryParams, setCategoryParams] = useSearchParams();
  const [toggleDrawer, setToggleDrawer] = useState(false);
  const dispatch = useDispatch();
  const searchResults = useSelector(resultsSelector);
  const { data: category, status: categoryStatus } = useFetchCategories();


  const categoryId =
    category && categoryParams.get("category")
      ? (category.filter((c) => {
          const urlCategory = categoryParams.get("category");
          const dbCategory = c.name;
          return dbCategory === urlCategory;
        })[0]?.id || null)
      : null;
      

  const { data: allEvents, status: allEventsStatus } = useFetchEvents();

  useEffect(() => {
    dispatch(setPathName(window.location.pathname));
  });

  useEffect(() => {
    if (categoryParams.get("category")) {
      dispatch(setCategoryId(categoryParams.get("category")));
    }
  }, [categoryParams, dispatch]);

  if (categoryStatus === "loading") {
    return <Loading />;
  }

  // filter data by date

  return (
    <>
      <HelmetHeader title={t("pages.events")} content="Event Dashboard" />
      <Header showSearchBox={false} />
      <HeroBanner searchData={allEventsStatus === "success" && allEvents} />
      {isEmpty(searchResults) ? <FilterEventFragment /> : <SearchResults />}
      <HomeDrawer
        toggleDrawer={toggleDrawer}
        onClose={() => setToggleDrawer(false)}
      />
      <FooterComponent
        toggleDrawer={toggleDrawer}
        setToggleDrawer={setToggleDrawer}
      />
    </>
  );
}
export default EventDashBoard;
