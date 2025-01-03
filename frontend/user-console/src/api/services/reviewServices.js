import { useQuery } from "@tanstack/react-query";
import httpRequest from "../../services/httpRequest";
import { ReviewAPI } from "../configs/review";

const getReviewListPaging = async (eventId, pageNumber, pageSize) => {
  try {
    const response = await httpRequest(
      ReviewAPI.getReviewListPaging(eventId, pageNumber, pageSize),
      { timeout: 5000 }
    );
    return response;
  } catch (err) {
    console.error("Error fetching paged reviews:", {
      status: err.response?.status,
      message: err.response?.data?.message || err.message,
      eventId,
      page: pageNumber
    });
    return {
      data: [],
      totalPages: 0,
      currentPage: pageNumber
    };
  }
};
const getReviewList = async (eventId) => {
  try {
    const response = await httpRequest(ReviewAPI.getReviewList(eventId));
    return response;
  } catch (err) {
    console.error("Error fetching reviews:", {
      status: err.response?.status,
      message: err.response?.data?.message || err.message,
      eventId
    });
    
    return {
      data: [],
      message: "No reviews available",
      status: 200
    };
  }
};
const submitReview = async (userId, body) => {
  try {
    const response = await httpRequest(ReviewAPI.submitReview(userId, body));
    return response;
  } catch (err) {
    return err.response.data;
  }
};
const editReview = async (userId, body) => {
  try {
    const response = await httpRequest(ReviewAPI.editReview(userId, body));
    return response;
  } catch (err) {
    return err.response.data;
  }
};
const deleteReview = async (userId, eventId) => {
  try {
    const response = await httpRequest(ReviewAPI.deleteReview(userId, eventId));
    return response;
  } catch (err) {
    return err.response.data;
  }
};
const checkExistReview = async (userId, eventId) => {
  try {
    const response = await httpRequest(
      ReviewAPI.checkExistReview(userId, eventId)
    );
    
    return {
      exists: response?.status === 200,
      status: response?.status || 404,
      message: response?.message || 'Error checking review existence'
    };
  } catch (error) {
    console.error('Check review existence error:', {
      userId,
      eventId,
      error: error?.response?.data || error.message
    });
    
    return {
      exists: false,
      status: error?.response?.status || 404,
      message: error?.response?.data?.message || 'Error checking review'
    };
  }
};
// React Query

export const useFetchReviewListPagin = ({ id, pageNumber, pageSize }) => {
  return useQuery(
    ["getReviewListPaging", { id, pageNumber, pageSize }],
    () => getReviewListPaging(id, pageNumber, pageSize),
    {
      staleTime: 0,
      cacheTime: 1000 * 60 * 60,
      refetchInterval: 5,
    }
  );
};
export const useFetchReviewList = (id) => {
  return useQuery(["getReviewList", id], () => getReviewList(id), {
    staleTime: 0,
    cacheTime: 1000 * 60 * 60,
    refetchInterval: 5000,
  });
};

const reviewServices = {
  getReviewListPaging,
  getReviewList,
  submitReview,
  checkExistReview,
  editReview,
  deleteReview,
};
export default reviewServices;
