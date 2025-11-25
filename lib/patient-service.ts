import { ApiClient } from "./api-client";
import type { Patient, ApiResponse } from "./types";

const apiClient = new ApiClient();

export const patientService = {
  async createPatient(
    data: Omit<Patient, "id" | "registrationDate">
  ): Promise<Patient> {
    const response = await apiClient.post<ApiResponse<Patient>>(
      "/patients",
      data
    );
    return response.data || ({} as Patient);
  },

  async getPatients(): Promise<Patient[]> {
    const response = await apiClient.get<ApiResponse<Patient[]>>("/patients");
    return response.data || [];
  },

  async getPatientById(id: string): Promise<Patient | null> {
    try {
      const response = await apiClient.get<ApiResponse<Patient>>(
        `/patients/${id}`
      );
      return response.data || null;
    } catch {
      return null;
    }
  },

  async updatePatient(id: string, data: Partial<Patient>): Promise<Patient> {
    const response = await apiClient.put<ApiResponse<Patient>>(
      `/patients/${id}`,
      data
    );
    return response.data || ({} as Patient);
  },

  async deletePatient(id: string): Promise<void> {
    await apiClient.delete(`/patients/${id}`);
  },
};
