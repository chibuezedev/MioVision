export interface User {
  id: string;
  _id: string;
  email: string;
  name: string;
  role: "doctor" | "admin" | "staff";
  hospitalId: string;
  createdAt: Date;
}

export interface Patient {
  id: string;
  _id: string;
  name: string;
  email?: string;
  phone: string;
  address: string;
  gender: "male" | "female" | "other";
  dateOfBirth: Date;
  registrationDate: Date;
  hospitalId: string;
  emergencyContact?: string;
  medicalHistory?: string;
}

export interface Appointment {
  id: string;
  _id: string;
  patientId: string;
  appointmentTime: Date;
  status: "scheduled" | "completed" | "cancelled";
  notes?: string;
  createdAt: Date;
}

export interface Examination {
  id: string;
  _id: string;
  patientId: string;
  examinationDate: Date;
  notes: string;
  leftEyeVision?: number;
  rightEyeVision?: number;
  intraocularPressure?: number;
  imageUrl?: string;
  createdBy: string;
}

export interface MyopiaPrediction {
  id: string;
  _id: string;
  examinationId: string;
  patientId: string;
  myopiaRisk: "low" | "medium" | "high";
  confidence: number;
  sphericalEquivalent?: number;
  recommendations: string[];
  predictedAt: Date;
  probabilityNormal: number;
  probabilityMyopia: number;
  mlPrediction: string
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
