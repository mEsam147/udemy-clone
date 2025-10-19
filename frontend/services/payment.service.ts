// services/payment.service.ts
import { fetchWrapper } from "@/lib/api";

export interface CheckoutSessionRequest {
  courseId: string;
}

export interface CheckoutSessionResponse {
  success: boolean;
  sessionId: string;
}

export interface WebhookBody {
  stripeSignature: string;
  payload: string;
}

export const paymentService = {
  createCheckoutSession: async (
    courseId: string
  ): Promise<CheckoutSessionResponse> => {
    try {
      const response = await fetchWrapper(
        "/payment/checkout",
        "POST",
        courseId
      );
      return response;
    } catch (error) {
      console.error("Payment service error:", error);
      throw error;
    }
  },

  handleWebhook: async (data: WebhookBody): Promise<void> => {
    try {
      await fetchWrapper("/payment/webhook", "POST", data.payload, {
        credentials: "omit", // Webhooks don't need credentials
      });
    } catch (error) {
      console.error("Webhook service error:", error);
      throw error;
    }
  },

  retrieveCheckoutSession: async (sessionId: string) => {
    try {
      const response = await fetchWrapper(
        `/payment/session/${sessionId}`,
        "GET"
      );
      return response;
    } catch (error) {
      console.error("Error retrieving checkout session:", error);
      throw error;
    }
  },

  verifyAndCreateEnrollment: (
    sessionId: string
  ): Promise<{
    success: boolean;
    data: any;
    message: string;
  }> => fetchWrapper("/payment/verify-enroll", "POST", { sessionId }),

  createEnrollmentFromPayment: (
    courseId: string,
    sessionId: string
  ): Promise<EnrollmentResponse> =>
    fetchWrapper("/enrollments/payment/enroll", "POST", {
      courseId,
      sessionId,
    }),



     // Plan subscription methods
  createPlanCheckoutSession: async (planId: string): Promise<CheckoutSessionResponse> => {
    try {
      const response = await fetchWrapper(
        "/payment/plan-checkout",
        "POST",
        { planId }
      );
      return response;
    } catch (error) {
      console.error("Plan checkout error:", error);
      throw error;
    }
  },

  getUserPlan: async (): Promise<{
    success: boolean;
    data: {
      plan: string;
      status: string;
      features: string[];
    };
  }> => {
    return fetchWrapper("/payment/user-plan", "GET");
  },

  updateUserPlan: async (userId: string, planId: string): Promise<{
    success: boolean;
    message: string;
    data: any;
  }> => {
    return fetchWrapper("/payment/update-plan", "POST", {
      userId,
      planId
    });
  },


    verifySubscription: async (sessionId: string): Promise<{
    success: boolean;
    message: string;
    subscription?: any;
  }> => {
    return fetchWrapper("/payment/verify-subscription", "POST", { sessionId });
  },



};
