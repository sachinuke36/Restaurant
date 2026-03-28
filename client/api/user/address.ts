import { apiRequest } from "../../services/api";

export const fetchAddress = () => {
  return apiRequest("/api/users/address");
};

export const addAddress = (data: {
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country?: string;
  isDefault?: boolean;
}) => {
  return apiRequest("/api/users/address", {
    method: "POST",
    body: data,
  });
};

export const updateAddress = (
  id: number,
  data: {
    fullName?: string;
    phone?: string;
    addressLine1?: string;
    addressLine2?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
    isDefault?: boolean;
  }
) => {
  return apiRequest(`/api/users/address/${id}`, {
    method: "PUT",
    body: data,
  });
};

export const deleteAddress = (id: number) => {
  return apiRequest(`/api/users/address/${id}`, {
    method: "DELETE",
  });
};

export const setDefaultAddress = (id: number) => {
  return apiRequest(`/api/users/address/${id}/default`, {
    method: "PATCH",
  });
};