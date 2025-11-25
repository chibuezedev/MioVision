"use client"

import { createContext, useContext, useState, type ReactNode, useCallback } from "react"
import type { Patient } from "@/lib/types"
import { patientService } from "@/lib/patient-service"

interface PatientsContextType {
  patients: Patient[]
  isLoading: boolean
  error: string | null
  fetchPatients: () => Promise<void>
  addPatient: (data: Omit<Patient, "id" | "registrationDate">) => Promise<void>
  updatePatient: (id: string, data: Partial<Patient>) => Promise<void>
  deletePatient: (id: string) => Promise<void>
  getPatientById: (id: string) => Promise<Patient | null>
}

const PatientsContext = createContext<PatientsContextType | undefined>(undefined)

export function PatientsProvider({ children }: { children: ReactNode }) {
  const [patients, setPatients] = useState<Patient[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchPatients = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await patientService.getPatients()
      setPatients(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch patients")
    } finally {
      setIsLoading(false)
    }
  }, [])

  const addPatient = useCallback(async (data: Omit<Patient, "id" | "registrationDate">) => {
    try {
      const newPatient = await patientService.createPatient(data)
      setPatients((prev) => [...prev, newPatient])
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add patient")
      throw err
    }
  }, [])

  const updatePatient = useCallback(async (id: string, data: Partial<Patient>) => {
    try {
      const updated = await patientService.updatePatient(id, data)
      setPatients((prev) => prev.map((p) => (p.id === id ? updated : p)))
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update patient")
      throw err
    }
  }, [])

  const deletePatient = useCallback(async (id: string) => {
    try {
      await patientService.deletePatient(id)
      setPatients((prev) => prev.filter((p) => p.id !== id))
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete patient")
      throw err
    }
  }, [])

  const getPatientById = useCallback(
    async (id: string): Promise<Patient | null> => {
      const patient = patients.find((p) => p._id === id)
      if (patient) return patient
      return patientService.getPatientById(id)
    },
    [patients],
  )

  return (
    <PatientsContext.Provider
      value={{
        patients,
        isLoading,
        error,
        fetchPatients,
        addPatient,
        updatePatient,
        deletePatient,
        getPatientById,
      }}
    >
      {children}
    </PatientsContext.Provider>
  )
}

export function usePatients() {
  const context = useContext(PatientsContext)
  if (!context) {
    throw new Error("usePatients must be used within PatientsProvider")
  }
  return context
}
