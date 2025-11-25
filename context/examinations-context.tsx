"use client";

import {
  createContext,
  useContext,
  useState,
  type ReactNode,
  useCallback,
} from "react";
import type { Examination } from "@/lib/types";
import { examinationService } from "@/lib/examination-service";

interface ExaminationsContextType {
  examinations: Examination[];
  isLoading: boolean;
  error: string | null;
  fetchExaminations: (patientId?: string) => Promise<void>;
  createExamination: (data: any) => Promise<void>;
  updateExamination: (id: string, data: Partial<Examination>) => Promise<void>;
  deleteExamination: (id: string) => Promise<void>;
  getExaminationById: (id: string) => Promise<Examination | null>;
}

const ExaminationsContext = createContext<ExaminationsContextType | undefined>(
  undefined
);

export function ExaminationsProvider({ children }: { children: ReactNode }) {
  const [examinations, setExaminations] = useState<Examination[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchExaminations = useCallback(async (patientId?: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await examinationService.getExaminations(patientId);
      setExaminations(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch examinations"
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createExamination = useCallback(async (data: FormData) => {
    try {
      const newExamination = await examinationService.createExamination(data);
      setExaminations((prev) => [...prev, newExamination]);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to create examination"
      );
      throw err;
    }
  }, []);

  const updateExamination = useCallback(
    async (id: string, data: Partial<Examination>) => {
      try {
        const updated = await examinationService.updateExamination(id, data);
        setExaminations((prev) => prev.map((e) => (e.id === id ? updated : e)));
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to update examination"
        );
        throw err;
      }
    },
    []
  );

  const deleteExamination = useCallback(async (id: string) => {
    try {
      await examinationService.deleteExamination(id);
      setExaminations((prev) => prev.filter((e) => e.id !== id));
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to delete examination"
      );
      throw err;
    }
  }, []);

  const getExaminationById = useCallback(
    async (id: string): Promise<Examination | null> => {
      const examination = examinations.find((e) => e.id === id);
      if (examination) return examination;
      return examinationService.getExaminationById(id);
    },
    [examinations]
  );

  return (
    <ExaminationsContext.Provider
      value={{
        examinations,
        isLoading,
        error,
        fetchExaminations,
        createExamination,
        updateExamination,
        deleteExamination,
        getExaminationById,
      }}
    >
      {children}
    </ExaminationsContext.Provider>
  );
}

export function useExaminations() {
  const context = useContext(ExaminationsContext);
  if (!context) {
    throw new Error("useExaminations must be used within ExaminationsProvider");
  }
  return context;
}
