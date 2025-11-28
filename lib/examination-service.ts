import { ApiClient } from "./api-client";
import type { Examination, MyopiaPrediction, ApiResponse } from "./types";

const apiClient = new ApiClient();

export const examinationService = {
  async createExamination(data: FormData): Promise<Examination> {
    const response = await fetch(
      `${
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"
      }/examinations`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken") || ""}`,
        },
        body: data,
      }
    );

    if (!response.ok) {
      throw new Error("Failed to create examination");
    }

    const result = await response.json();
    return result.data || ({} as Examination);
  },

  async getExaminations(patientId?: string): Promise<Examination[]> {
    const endpoint = patientId
      ? `/examinations?patientId=${patientId}`
      : "/examinations";
    const response = await apiClient.get<ApiResponse<Examination[]>>(endpoint);
    return response.data || [];
  },

  async getExaminationById(id: string): Promise<Examination | null> {
    try {
      const response = await apiClient.get<ApiResponse<Examination>>(
        `/examinations/${id}`
      );
      return response.data || null;
    } catch {
      return null;
    }
  },

  async updateExamination(
    id: string,
    data: Partial<Examination>
  ): Promise<Examination> {
    const response = await apiClient.put<ApiResponse<Examination>>(
      `/examinations/${id}`,
      data
    );
    return response.data || ({} as Examination);
  },

  async uploadExaminationImage(
    id: string,
    file: File
  ): Promise<{ imageUrl: string }> {
    const formData = new FormData();
    formData.append("image", file);

    const response = await fetch(
      `${
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"
      }/examinations/${id}/upload-image`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken") || ""}`,
        },
        body: formData,
      }
    );

    if (!response.ok) {
      throw new Error("Failed to upload image");
    }

    const result = await response.json();
    return result.data || {};
  },

  async deleteExamination(id: string): Promise<void> {
    await apiClient.delete(`/examinations/${id}`);
  },

  async predictMyopia(examinationId: string): Promise<MyopiaPrediction> {
    const response = await apiClient.post<ApiResponse<MyopiaPrediction>>(
      `/examinations/${examinationId}/predict`,
      {}
    );
    return response.data || ({} as MyopiaPrediction);
  },

  async getMyopiaPredictions(patientId?: string): Promise<MyopiaPrediction[]> {
    const endpoint = patientId
      ? `/predictions?patientId=${patientId}`
      : "/predictions";
    const response = await apiClient.get<ApiResponse<MyopiaPrediction[]>>(
      endpoint
    );
    return response.data || [];
  },
};
