import { useQuery } from "@tanstack/react-query";
import httpRequest from "../../services/httpRequest";
import { OrganizationAPI } from "../configs/organization";

const submitOrganizer = async (data) => {
  try {
    const response = await httpRequest({
      url: '/form/organization',
      method: 'POST',
      data
    });
    return response;
  } catch (error) {
    console.error('Submit organizer error:', error);
    return error.response;
  }
};
const findOrganizerById = async (id) => {
  try {
    const response = await httpRequest(OrganizationAPI.findOrganizerById(id));
    return response.data;
  } catch (error) {
    return error.response.data;
  }
};
const findOrganizerEventList = async (email) => {
  try {
    const response = await httpRequest(
      OrganizationAPI.findOrganizerEventList(email)
    );
    return response.data;
  } catch (error) {
    return error.response.data;
  }
};
export const useFindOrganizerEventList = (email) => {
  return useQuery(
    ["findOrganizerEventList", email],
    () => findOrganizerEventList(email),
    {
      staleTime: 0,
      cacheTime: 1000 * 60,
    }
  );
};
export const useFindOrganizerById = (id) => {
  return useQuery(["findOrganizerById", id], () => findOrganizerById(id), {
    staleTime: 0,
    cacheTime: 1000 * 60,
  });
};
const organizationServices = {
  submitOrganizer,
  findOrganizerById,
  findOrganizerEventList,
};
export default organizationServices;
