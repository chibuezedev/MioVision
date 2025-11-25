"use client"

import { useState, useCallback } from "react"

interface ValidationRule {
  required?: boolean
  minLength?: number
  maxLength?: number
  pattern?: RegExp
  custom?: (value: any) => boolean | string
}

interface ValidationSchema {
  [key: string]: ValidationRule
}

interface ValidationErrors {
  [key: string]: string
}

export function useFormValidation(schema: ValidationSchema) {
  const [errors, setErrors] = useState<ValidationErrors>({})

  const validate = useCallback(
    (formData: Record<string, any>): boolean => {
      const newErrors: ValidationErrors = {}

      Object.entries(schema).forEach(([field, rule]) => {
        const value = formData[field]

        if (rule.required && !value) {
          newErrors[field] = `${field} is required`
          return
        }

        if (value && rule.minLength && value.length < rule.minLength) {
          newErrors[field] = `${field} must be at least ${rule.minLength} characters`
          return
        }

        if (value && rule.maxLength && value.length > rule.maxLength) {
          newErrors[field] = `${field} must be no more than ${rule.maxLength} characters`
          return
        }

        if (value && rule.pattern && !rule.pattern.test(value)) {
          newErrors[field] = `${field} format is invalid`
          return
        }

        if (value && rule.custom) {
          const result = rule.custom(value)
          if (result !== true) {
            newErrors[field] = typeof result === "string" ? result : `${field} is invalid`
          }
        }
      })

      setErrors(newErrors)
      return Object.keys(newErrors).length === 0
    },
    [schema],
  )

  const clearErrors = useCallback(() => {
    setErrors({})
  }, [])

  return { errors, validate, clearErrors }
}
