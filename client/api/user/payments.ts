import { apiRequest } from "../../services/api";

export const createPaymentIntent = () => {
  return apiRequest("/api/users/payments/create-intent", {
    method: "POST",
  });
};
