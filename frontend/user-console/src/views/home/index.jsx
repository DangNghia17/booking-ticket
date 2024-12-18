/* eslint-disable react-hooks/exhaustive-deps */
import { Affix } from "antd";
import React, { useState, useMemo, useEffect } from "react";
import { useTranslation } from "react-i18next";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useMedia } from "react-use";
import {
  useFetchBestSellerEvents,
  useFetchEventsByProvince,
  useFetchFeaturedEvents,
} from "../../api/services/eventServices";
import { motion } from "framer-motion";
import Carousel from "../../components/common/carousel";
import AppDrawer from "../../components/common/drawer";
import EventHomeItem from "../../components/common/event-home-item";
import Header from "../../components/common/header";
import SectionTitle from "../../components/common/section-title";
import SiderBar from "../../components/common/sider";
import ViewMoreButton from "../../components/common/view-more-button";
import EventHomeSkeletonItem from "../../components/event-home-skeleton";
import FooterComponent from "../../components/FooterComponent";
import HelmetHeader from "../../components/helmet";
import HomeDrawer from "../../components/home-drawer";
import { setProvince, setStatus } from "../../redux/slices/filterSlice";
import { setPathName } from "../../redux/slices/routeSlice";
import { EventStatus } from "../../utils/constants";
import { isNotEmpty } from "../../utils/utils";
import SearchBox from "../../components/common/searchbox";
import { useCheckEventStatus } from "../../hooks/useCheckEventStatus";

function Home() {
  const [toggleDrawer, setToggleDrawer] = useState(false);
  const cityName = localStorage.getItem("city");
  const { data: featuredEvents = [], status: featuredEventStatus } =
    useFetchFeaturedEvents();
  const { data: bestSellerEvents = [], status: bestSellerEventsStatus } =
    useFetchBestSellerEvents();
  const { data: eventsByProvince = [], status: eventsByProvinceStatus } =
    useFetchEventsByProvince(cityName);
  const successStatus = featuredEventStatus === "success";
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isMobile = useMedia("(max-width: 767px)");
  dispatch(setPathName(window.location.pathname));

  // framer motion
  const container = {
    hidden: { opacity: 0, x: 40 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        delayChildren: 0.3,
        staggerChildren: 0.2,
      },
    },
  };

  const hasData = {
    featured: Array.isArray(featuredEvents) && featuredEvents.length > 0,
    bestSeller: Array.isArray(bestSellerEvents) && bestSellerEvents.length > 0,
    byProvince: Array.isArray(eventsByProvince?.data) && eventsByProvince.data.length > 0
  };

  const searchData = useMemo(() => {
    const featured = Array.isArray(featuredEvents) ? featuredEvents : [];
    const bestSeller = Array.isArray(bestSellerEvents) ? bestSellerEvents : [];
    const byProvince = Array.isArray(eventsByProvince?.data) ? eventsByProvince.data : [];



    const allEvents = [
      ...featured,
      ...bestSeller,
      ...byProvince
    ].filter(event => event && event.id);


    return Array.from(new Map(allEvents.map(event => [event.id, event])).values());
  }, [featuredEvents, bestSellerEvents, eventsByProvince]);

  const carouselSection = featuredEventStatus === "success" ? (
    isMobile ? (
      <Carousel data={featuredEvents || []} />
    ) : (
      <Carousel data={featuredEvents || []} loop={false} />
    )
  ) : (
    <Skeleton width={"100%"} height={"20vh"} />
  );

  // Thêm hook check status
  const { statusError } = useCheckEventStatus();

  // Log error nếu có
  useEffect(() => {
    if (statusError) {
      console.error('Error checking event status:', statusError);
    }
  }, [statusError]);

  return (
    <>
      <HelmetHeader title={t("pages.home")} content="Home page" />
      <Affix offsetTop={0}>
        <Header>
          <SearchBox 
            data={searchData} 
            placeholder={t("search.placeholder")} 
          />
        </Header>
      </Affix>
      <div className="home-container">
        <AppDrawer />
        <div className="h-auto">
          <SiderBar className="sider" />
        </div>
        <div className="home-content">
          {carouselSection}
          <hr className="border-gray-200 sm:mx-auto dark:border-gray-700 lg:my-4 w-[80%]" />
          <div className="home-popular">
            {bestSellerEventsStatus === "success" && hasData.bestSeller && (
              <div className="home-popular">
                <SectionTitle>{t("event.best-seller")}</SectionTitle>
                <motion.div
                  className="home-popular-content"
                  variants={container}
                  initial="hidden"
                  animate="visible"
                >
                  {!successStatus
                    ? [...Array(10)].map((_, i) => (
                        <EventHomeSkeletonItem key={`skeleton-${i}`} />
                      ))
                    : bestSellerEvents.slice(0, 10).map((event) => (
                        <div key={`bestseller-${event.id}`}>
                          <EventHomeItem event={event} />
                        </div>
                      ))}
                </motion.div>
              </div>
            )}
          </div>
          {hasData.featured && (
            <div className="home-popular">
              <SectionTitle>{t("event.trending")}</SectionTitle>
              <motion.div
                className="home-popular-content"
                variants={container}
                initial="hidden"
                animate="visible"
              >
                {featuredEventStatus !== "success"
                  ? [...Array(16)].map((_, i) => (
                      <EventHomeSkeletonItem key={`featured-skeleton-${i}`} />
                    ))
                  : featuredEvents
                      // .filter((e) => e.status !== EventStatus.SOLDOUT)
                      .slice(0, 12)
                      .map((event) => (
                        <div key={`featured-${event.id}`}>
                          <EventHomeItem event={event} />
                        </div>
                      ))}
              </motion.div>
              <ViewMoreButton
                onClick={() => {
                  dispatch(setStatus(EventStatus.AVAILABLE));
                  navigate("/events");
                }}
              />
            </div>
          )}
          {hasData.byProvince && cityName && (
            <div className="home-popular">
              <SectionTitle>
                {t("event.near-you", {
                  val: cityName,
                })}
              </SectionTitle>
              <motion.div
                className="home-popular-content"
                variants={container}
                initial="hidden"
                animate="visible"
              >
                {eventsByProvinceStatus !== "success"
                  ? [...Array(16)].map((_, i) => (
                      <EventHomeSkeletonItem key={`province-skeleton-${i}`} />
                    ))
                  : (eventsByProvince?.data || [])
                      .filter((e) => e.status !== EventStatus.SOLDOUT)
                      .slice(0, 16)
                      .map((event) => (
                        <div key={`province-${event.id}`}>
                          <EventHomeItem event={event} />
                        </div>
                      ))}
              </motion.div>
              <ViewMoreButton
                onClick={() => {
                  dispatch(setStatus(EventStatus.AVAILABLE));
                  dispatch(
                    setProvince(
                      cityName
                        ? cityName === "Thành phố Hồ Chí Minh"
                          ? "Thành phố Hồ Chí Minh"
                          : cityName
                        : "Thành phố Hồ Chí Minh"
                    )
                  );
                  navigate("/events");
                }}
              />
            </div>
          )}
        </div>
      </div>
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

export default Home;
