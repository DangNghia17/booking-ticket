import { useQuery } from "@tanstack/react-query";
import httpRequest from "../../services/httpRequest";
import { EventAPI } from "../configs/event";

const fetchAllEvents = async () => {
  const response = await httpRequest(EventAPI.getAllEvents);
  return response.data;
};
export const setEventStatus = async () => {
  try {
    const response = await httpRequest(EventAPI.checkEventStatus);
    return response?.data || { success: true, message: "Status checked" };
  } catch (error) {
    console.error('Error checking event status:', error);
    throw error;
  }
};
const fetchFeaturedEvents = async () => {
  try {
    const response = await httpRequest(EventAPI.getFeaturedEvents);

    if (response && response.data) {
      return Array.isArray(response.data) ? response.data : [];
    }
    return [];
  } catch (error) {
    console.error('Error fetching featured events:', error);
    return [];
  }
};
const fetchBestSellerEvents = async () => {
  try {
    const response = await httpRequest(EventAPI.getBestSellerEvents);
   
    if (response && response.data) {
      return Array.isArray(response.data) ? response.data : [];
    }
    return [];
  } catch (error) {
    console.error('Error fetching best seller events:', error);
    return [];
  }
};
const getEventByName = async (name) => {
  const response = await httpRequest(EventAPI.getEventByName(name));
  return response.data;
};
const getEventById = async (id) => {
  const response = await httpRequest(EventAPI.getEventById(id));
  return response.data;
};
const createEvent = async (body) => {
  const response = await httpRequest(EventAPI.createEvent(body));
  return response.data;
};
const fetchEventsForPagination = async (params) => {
  const response = await httpRequest(
    EventAPI.getAllEventsWithPagination(params)
  );
  return response;
};
const fetchEventsByProvince = async (params) => {
  try {
    const response = await httpRequest(EventAPI.findEventsByProvince(params));
    return {
      data: Array.isArray(response?.data) ? response.data : [],
      success: response?.success || false,
      message: response?.message || ''
    };
  } catch (error) {
    console.error('Error fetching events by province:', error);
    return {
      data: [],
      success: false,
      message: error.message
    };
  }
};
const fetchEventByFilter = async (params) => {
  try {
    const response = await httpRequest(EventAPI.getEventByFilter(params));
    return response.data;
  } catch (error) {
    console.error("Error fetching filtered events:", error);
    return [];
  }
};
const fetchOrganizerByEventId = async (eventId) => {
  try {
    const response = await httpRequest(
      EventAPI.findOrganizerByEventId(eventId)
    );
    return response.data;
  } catch (e) {
    return e.response.data;
  }
};
// React Query

export const useFetchEvents = (staleTime = 30000) => {
  return useQuery(["events"], fetchAllEvents, {
    staleTime: 1000 * 60 * 60,
    cacheTime: 1000 * 60 * 60 * 24,
    refetchIntervalInBackground: 1000 * 10,
  });
};
export const useFetchOrganizerByEventId = (id) => {
  return useQuery(
    ["findOrganizerByEventId", id],
    () => fetchOrganizerByEventId(id),
    {
      staleTime: 1000 * 60 * 60,
      cacheTime: 1000 * 60 * 60 * 24,
      refetchIntervalInBackground: 1000 * 10,
      retry: 3,
      retryDelay: 1000,
      onError: (error) => {
        console.error('Error fetching organizer:', error);
      }
    }
  );
};
export const useCheckEventsStatus = () => {
  return useQuery(["checkEventStatus"], setEventStatus, {
    staleTime: 0,
    cacheTime: 24 * 60 * 60 * 1000, // 24 giờ
    refetchInterval: 1000 * 60 * 10, // 10 phút
    retry: 3,
    retryDelay: 1000,
    onError: (error) => {
      console.error('Error checking event status:', error);
    },
    select: (data) => data || { success: true, message: "Status checked" }
  });
};
export const useFetchFeaturedEvents = () => {
  return useQuery(["featuredEvents"], async () => {
    try {
      const response = await fetchFeaturedEvents();
      return response;
    } catch (error) {
      return { data: [] };
    }
  }, {
    staleTime: 0,
    cacheTime: 1000 * 60 * 60,
    retry: 2,
    retryDelay: 1000,
  });
};
export const useFetchBestSellerEvents = () => {
  return useQuery(["fetchBestSellerEvents"], async () => {
    try {
      const response = await fetchBestSellerEvents();
      return response;
    } catch (error) {
      return { data: [] };
    }
  }, {
    staleTime: 0,
    cacheTime: 1000 * 60 * 60,
    retry: 2,
    retryDelay: 1000,
  });
};
export const useFetchEventsForPagination = (params) => {
  return useQuery(
    ["eventsPaginated", params],
    () => fetchEventsForPagination(params),
    {
      staleTime: 30000,
    }
  );
};
export const useEventDetails = (id) => {
  return useQuery(["getEventDetail", id], () => getEventById(id), {
    staleTime: 1000 * 60,
    cacheTime: 1000 * 60,
  });
};
export const useFetchEventsByFilter = (params) => {
  return useQuery(
    ["getEventsByFilter", params],
    () => fetchEventByFilter(params),
    {
      staleTime: 0,
    }
  );
};
export const useFetchEventsByProvince = (params) => {
  return useQuery(
    ["getEventsByProvince", params],
    async () => {
      try {
        const response = await fetchEventsByProvince(params);
        return response;
      } catch (error) {
        return { data: [] };
      }
    },
    {
      staleTime: 0,
      cacheTime: 1000 * 60 * 60,
      retry: 2,
      retryDelay: 1000,
      enabled: !!params,
    }
  );
};

const eventServices = {
  fetchAllEvents,
  fetchEventsForPagination,
  getEventByName,
  getEventById,
  fetchEventByFilter,
  setEventStatus,
  fetchFeaturedEvents,
  fetchOrganizerByEventId,
  createEvent,
};
export default eventServices;
