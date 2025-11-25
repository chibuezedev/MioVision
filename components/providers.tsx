"use client";

import type { ReactNode } from "react";
import { AuthProvider } from "@/context/auth-context";
import { PatientsProvider } from "@/context/patients-context";
import { ExaminationsProvider } from "@/context/examinations-context";
import { PredictionsProvider } from "@/context/predictions-context";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <PatientsProvider>
        <ExaminationsProvider>
          <PredictionsProvider>{children}</PredictionsProvider>
        </ExaminationsProvider>
      </PatientsProvider>
    </AuthProvider>
  );
}
