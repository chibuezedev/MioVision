import { ApiClient } from "./api-client";
import type { ApiResponse } from "./types";

const apiClient = new ApiClient();

export const predictionService = {
  async createPrediction(examinationId: string): Promise<any> {
    const response = await fetch(
      `${
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"
      }/predictions/examinations/${examinationId}/predict`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken") || ""}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to create prediction");
    }

    const data = await response.json();
    return data.data || {};
  },

  async getPredictions(): Promise<any[]> {
    const response = await apiClient.get<ApiResponse<any[]>>("/predictions");
    return response.data || [];
  },

  async getPrediction(id: string): Promise<any | null> {
    try {
      const response = await apiClient.get<ApiResponse<any>>(
        `/predictions/${id}`
      );
      return response.data || null;
    } catch {
      return null;
    }
  },

  async getPatientPredictions(patientId: string): Promise<any> {
    const response = await apiClient.get<ApiResponse<any>>(
      `/predictions/patient/${patientId}`
    );
    return response.data || ({} as any);
  },
};
