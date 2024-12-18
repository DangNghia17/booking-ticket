/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
/* eslint-disable react-hooks/exhaustive-deps */
import React from 'react';
import axios from "axios";
import { createContext, useContext, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import { useFetchUserInfo } from "../api/services/accountServices";
import customerServices from "../api/services/customerServices";
import eventServices, {
  useCheckEventsStatus,
} from "../api/services/eventServices";
import { AlertPopup } from "../components/common/alert";
import { userInfoSelector } from "../redux/slices/accountSlice";
import { isNotEmpty } from "../utils/utils";

const UserActionContext = createContext();
const { addWishlistItem, clearAllWishlist, removeWishlistItem, fetchWishlist } =
  customerServices;

const { getEventById } = eventServices;
export const UserActionContextProvider = ({ children }) => {
  const [eventId, setEventId] = useState("");
  const [wishlist, setWishlist] = useState([]);
  const [followingList, setFollowingList] = useState([]);
  const [followingOrganizerList, setFollowingOrganizerList] = useState([]);
  const [wishlistEvent, setWishlistEvent] = useState();
  const [activeDrawer, toggleDrawer] = useState(false);
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const userInfo = useSelector(userInfoSelector);
  const cityName = localStorage.getItem("city");
  const { data: checkedEvents } = useCheckEventsStatus();
  const { data: user } = useFetchUserInfo(userInfo ? userInfo.email : "");

  const getWishlist = async () => {
    setWishlistEvent([]);
    try {
      if (userInfo) {
        const list = await fetchWishlist(userInfo.id);
        if (list && list.data) {
          localStorage.setItem("userWishlist", JSON.stringify(list.data));
          setWishlist(list.data);
          
          // Fetch event details
          if (Array.isArray(list.data)) {
            const promises = list.data.map(eventId => getEventById(eventId));
            const events = await Promise.all(promises);
            setWishlistEvent(events.map(response => response?.data).filter(Boolean));
          }
        }
      } else {
        localStorage.setItem("userWishlist", JSON.stringify([]));
        setWishlist([]);
      }
    } catch (error) {
      console.error("Error fetching wishlist:", error);
      localStorage.setItem("userWishlist", JSON.stringify([]));
      setWishlist([]);
    }
  };
  const addToWishlist = async (eventId) => {
    try {
      if (!userInfo?.id) return;

      await addWishlistItem(eventId, userInfo.id);
      
      const newWishlist = [...wishlist, eventId];
      setWishlist(newWishlist);
      localStorage.setItem("userWishlist", JSON.stringify(newWishlist));
      
      AlertPopup({
        title: t("wishlist.add.title"),
        text: t("wishlist.add.text"),
      });
      
      await getWishlist();
    } catch (error) {
      console.error("Error adding to wishlist:", error);
    }
  };
  const getLocation = () => {
    navigator.geolocation.getCurrentPosition(async function (position) {
      const latitude = position.coords.latitude;
      const longitude = position.coords.longitude;
      
      try {
        const response = await axios.get(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
        );
        
        const address = response.data.address;
        const city = address.city || address.state || address.province;
        localStorage.setItem("city", city);
      } catch (error) {
        console.error("Không thể lấy được vị trí:", error);
        localStorage.setItem("city", "Hà Nội");
      }
    },
    (error) => {
      console.error("Lỗi lấy vị trí:", error);
      localStorage.setItem("city", "Hà Nội");
    });
  };
  useEffect(() => {
    if (userInfo) {
      getWishlist();
    }
  }, [userInfo]);
  useEffect(() => {
    getLocation();
  }, [cityName, userInfo]);
  const removeFromWishlist = async (eventId) => {
    let values = [...wishlist];
    values = values.filter((prod) => prod !== eventId);
    setWishlist(values);
    const list = {
      wishlist: values,
    };
    AlertPopup({
      title: t("wishlist.remove.title"),
      text: t("wishlist.remove.text"),
    });
    await removeWishlistItem(eventId, userInfo?.id);
    // reactLocalStorage.setObject("userWishlist", list);
    localStorage.setItem("userWishlist", JSON.stringify(list));
    getWishlist();
  };
  const clearWishlist = async () => {
    setWishlist([]);
    const list = {
      wishlist: [],
    };
    await clearAllWishlist(userInfo?.id);
    localStorage.setItem("userWishlist", JSON.stringify(list));
    getWishlist();
  };
  return (
    <UserActionContext.Provider
      value={{
        wishlist,
        wishlistEvent,
        followingList,
        followingOrganizerList,
        addToWishlist,
        removeFromWishlist,
        getWishlist,
        clearWishlist,
        activeDrawer,
        toggleDrawer,
        // checkedEvents,
        user,
        eventId,
        setEventId,
      }}
    >
      {children}
    </UserActionContext.Provider>
  );
};
export const useUserActionContext = () => {
  const context = useContext(UserActionContext);
  return context;
};
