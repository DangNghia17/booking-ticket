import { useQuery } from "@tanstack/react-query";
import httpRequest from "../../services/httpRequest";
import { OrganizationAPI } from "../configs/organization";

const submitOrganizer = async (body) => {
  try {
    const response = await httpRequest(OrganizationAPI.submitOrganizer(body));
    return response;
  } catch (error) {
    return error.response.data;
  }
};
const approveOrganizer = async (body) => {
  try {
    const response = await httpRequest(OrganizationAPI.approveOrganizer(body));
    return response;
  } catch (error) {
    return error.response.data;
  }
};
const refuseOrganizer = async (body) => {
  try {
    const response = await httpRequest(OrganizationAPI.refuseOrganizer(body));
    return response;
  } catch (error) {
    return error.response.data;
  }
};
const updateBioAndAddress = async (id, body) => {
  try {
    const response = await httpRequest(
      OrganizationAPI.updateBioAndAddress(id, body)
    );
    return response;
  } catch (error) {
    return error.response.data;
  }
};
const getOrganizerByEmail = async (email) => {
  try {
    const response = await httpRequest(
      OrganizationAPI.findOrganizerByEmail(email)
    );
    return response;
  } catch (error) {
    return error.response.data;
  }
};
const createTemplateTicket = async (id, body) => {
  try {
    const response = await httpRequest(
      OrganizationAPI.createTemplateTicket(id, body)
    );
    return response;
  } catch (error) {
    return error.response.data;
  }
};
const getTemplateTicket = async (id) => {
  try {
    const response = await httpRequest(OrganizationAPI.getTemplateTicket(id));
    return response.data;
  } catch (error) {
    return error.response.data;
  }
};

const findOrganizerById = async (id) => {
  try {
    const response = await httpRequest(OrganizationAPI.findOrganizerById(id));
    return response.data;
  } catch (error) {}
};
const findAllOrganizers = async () => {
  try {
    const response = await httpRequest(OrganizationAPI.findAllOrganizers);
    return response.data;
  } catch (error) {
    return error.response.data;
  }
};
const getEventsByOrganizationId = async (id) => {
  try {
    const response = await httpRequest(OrganizationAPI.findEventByOrgId(id));
    return response.data;
  } catch (error) {
    return error.response.data;
  }
};
export const useFetchTemplateTicket = (id) => {
  return useQuery(["getTemplateTicket", id], () => getTemplateTicket(id), {
    staleTime: 30000,
    refetchInterval: 5000,
  });
};
export const useFetchOrganizerByEmail = (email) => {
  return useQuery(
    ["getOrganizerByEmail", email],
    () => getOrganizerByEmail(email),
    {
      staleTime: 30000,
      refetchInterval: 5000,
    }
  );
};
const getStatistic = async (email) => {
  try {
    const response = await httpRequest(OrganizationAPI.statistic(email));
    return response.data;
  } catch (error) {
    return error.response.data;
  }
};

export const useFetchAllOrganizers = () => {
  return useQuery(["findAllOrganizers"], findAllOrganizers, {
    staleTime: 0,
    refetchInterval: 5000,
  });
};
export const useFetchEventsByOrgID = (id) => {
  return useQuery(
    ["getEventsByOrganizationId", id],
    () => getEventsByOrganizationId(id),
    {
      staleTime: 0,
      refetchInterval: 5000,
      retry: 3,
      onError: (error) => {
        console.error('Fetch events error:', error);
      }
    }
  );
};
export const useGetStatisticByID = (email) => {
  return useQuery(["getStatistic", email], () => getStatistic(email), {
    staleTime: 0,
    refetchInterval: 1000 * 10,
  });
};
const getPaymentListByOrganizerID = async (userId) => {
  try {
    const response = await httpRequest(
      OrganizationAPI.getPaymentListByOrganizerID(userId)
    );
    return response.data;
  } catch (error) {
    return error.response.data;
  }
};
export const useGetPaymentListByOrganizerID = (id) => {
  return useQuery(
    ["getPaymentListByOrganizerID", id],
    () => getPaymentListByOrganizerID(id),
    {
      staleTime: 0,
      refetchInterval: 1000 * 10,
    }
  );
};
const organizationServices = {
  submitOrganizer,
  getEventsByOrganizationId,
  getOrganizerByEmail,
  updateBioAndAddress,
  findOrganizerById,
  createTemplateTicket,
  getTemplateTicket,
  approveOrganizer,
  refuseOrganizer,
};
export default organizationServices;
