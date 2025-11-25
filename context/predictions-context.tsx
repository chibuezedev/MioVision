"use client";

import {
  createContext,
  useContext,
  useState,
  type ReactNode,
  useCallback,
} from "react";
import type { MyopiaPrediction } from "@/lib/types";
import { predictionService } from "@/lib/prediction-service";

interface PredictionsContextType {
  predictions: MyopiaPrediction[];
  isLoading: boolean;
  error: string | null;
  fetchPredictions: () => Promise<void>;
  createPrediction: (examinationId: string) => Promise<void>;
  getPredictionById: (id: string) => Promise<MyopiaPrediction | null>;
  getPatientPredictions: (patientId: string) => Promise<MyopiaPrediction>;
}

const PredictionsContext = createContext<PredictionsContextType | undefined>(
  undefined
);

export function PredictionsProvider({ children }: { children: ReactNode }) {
  const [predictions, setPredictions] = useState<MyopiaPrediction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPredictions = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await predictionService.getPredictions();
      setPredictions(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch predictions"
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createPrediction = useCallback(
    async (examinationId: string) => {
      try {
        const newPrediction = await predictionService.createPrediction(
          examinationId
        );

        setPredictions((prev) => {
          if (prev.some((p) => p._id === newPrediction._id)) {
            return prev;
          }
          return [...prev, newPrediction];
        });

        return newPrediction;
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to create prediction"
        );
        throw err;
      }
    },
    [setPredictions, setError]
  );

  const getPredictionById = useCallback(
    async (id: string): Promise<MyopiaPrediction | null> => {
      const prediction = predictions.find((p) => p.id === id);
      if (prediction) return prediction;
      return predictionService.getPrediction(id);
    },
    [predictions]
  );

  const getPatientPredictions = useCallback(async (patientId: string) => {
    try {
      return await predictionService.getPatientPredictions(patientId);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to fetch patient predictions"
      );
      throw err;
    }
  }, []);

  return (
    <PredictionsContext.Provider
      value={{
        predictions,
        isLoading,
        error,
        fetchPredictions,
        createPrediction,
        getPredictionById,
        getPatientPredictions,
      }}
    >
      {children}
    </PredictionsContext.Provider>
  );
}

export function usePredictions() {
  const context = useContext(PredictionsContext);
  if (!context) {
    throw new Error("usePredictions must be used within PredictionsProvider");
  }
  return context;
}
