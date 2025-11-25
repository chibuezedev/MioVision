"use client"

import { AlertCircle, CheckCircle, Info, AlertTriangle, X } from "lucide-react"

interface ToastProps {
  message: string
  type: "success" | "error" | "info" | "warning"
  onClose: () => void
}

export default function Toast({ message, type, onClose }: ToastProps) {
  const icons = {
    success: <CheckCircle className="w-5 h-5 text-green-600" />,
    error: <AlertCircle className="w-5 h-5 text-destructive" />,
    info: <Info className="w-5 h-5 text-primary" />,
    warning: <AlertTriangle className="w-5 h-5 text-accent" />,
  }

  const colors = {
    success: "bg-green-50 border-green-200 text-green-900",
    error: "bg-destructive/10 border-destructive/20 text-destructive",
    info: "bg-primary/10 border-primary/20 text-primary",
    warning: "bg-accent/10 border-accent/20 text-accent",
  }

  return (
    <div
      className={`flex items-start gap-3 p-4 rounded-lg border ${colors[type]} pointer-events-auto animate-in fade-in slide-in-from-right`}
    >
      {icons[type]}
      <p className="flex-1 text-sm font-medium">{message}</p>
      <button onClick={onClose} className="text-current opacity-70 hover:opacity-100 transition-opacity">
        <X className="w-4 h-4" />
      </button>
    </div>
  )
}
