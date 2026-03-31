import { apiRequest } from "../../services/api";

export interface PaymentIntentResponse {
  clientSecret: string;
  paymentIntentId: string;
  amount: number;
}

export const createPaymentIntent = (address_id: number): Promise<PaymentIntentResponse> => {
  return apiRequest("/api/users/payments/create-intent", {
    method: "POST",
    body: { address_id },
  });
};
