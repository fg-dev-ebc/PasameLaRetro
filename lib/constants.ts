import type { Enums } from "@/lib/supabase/database.types"

export const conditionLabels: Record<Enums<"equipment_condition">, string> = {
  new: "Nuevo",
  excellent: "Excelente",
  good: "Bueno",
  fair: "Uso intenso",
  needs_service: "Requiere servicio",
}

export const statusLabels: Record<Enums<"equipment_status">, string> = {
  active: "Activo",
  paused: "Pausado",
  maintenance: "Mantenimiento",
  archived: "Archivado",
}

export const bookingStatusLabels: Record<Enums<"booking_status">, string> = {
  pending: "Pendiente",
  confirmed: "Confirmada",
  cancelled: "Cancelada",
  completed: "Completada",
  rejected: "Rechazada",
}

export const roleLabels: Record<Enums<"user_role">, string> = {
  owner: "Publico maquinaria",
  renter: "Rento maquinaria",
  both: "Publico y rento",
}

export const weekdays = [
  { value: 0, short: "Dom", label: "Domingo" },
  { value: 1, short: "Lun", label: "Lunes" },
  { value: 2, short: "Mar", label: "Martes" },
  { value: 3, short: "Mie", label: "Miercoles" },
  { value: 4, short: "Jue", label: "Jueves" },
  { value: 5, short: "Vie", label: "Viernes" },
  { value: 6, short: "Sab", label: "Sabado" },
]
