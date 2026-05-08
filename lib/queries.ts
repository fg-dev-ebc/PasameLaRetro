import { createClient } from "@/lib/supabase/server"
import type { Tables } from "@/lib/supabase/database.types"

export type EquipmentCardRecord = Tables<"equipment"> & {
  categories: Pick<Tables<"categories">, "name" | "slug"> | null
  equipment_images: Pick<Tables<"equipment_images">, "public_url" | "alt_text" | "position">[]
  owner?: Pick<Tables<"profiles">, "full_name" | "company_name" | "location" | "phone"> | null
}

export type EquipmentDetailRecord = EquipmentCardRecord & {
  owner: Pick<Tables<"profiles">, "full_name" | "company_name" | "location" | "phone" | "avatar_url"> | null
  availability_rules: Tables<"availability_rules">[]
}

export type BookingRecord = Tables<"bookings"> & {
  equipment: (Pick<Tables<"equipment">, "title" | "location" | "price_per_hour"> & {
    equipment_images: Pick<Tables<"equipment_images">, "public_url" | "position">[]
  }) | null
  owner: Pick<Tables<"profiles">, "full_name" | "company_name" | "phone"> | null
  renter: Pick<Tables<"profiles">, "full_name" | "company_name" | "phone"> | null
}

export type CatalogFilters = {
  q?: string
  category?: string
  condition?: string
  location?: string
  min?: string
  max?: string
  sort?: string
}

export async function getCategories() {
  const supabase = await createClient()
  const { data } = await supabase.from("categories").select("*").order("name")
  return (data ?? []) as Tables<"categories">[]
}

export async function getCurrentUserProfile() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { user: null, profile: null }

  const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single()
  const profile = data as Tables<"profiles"> | null

  return { user, profile }
}

export async function getEquipmentList(filters: CatalogFilters = {}, limit?: number) {
  const supabase = await createClient()
  const categories = await getCategories()
  const category = categories.find((item) => item.slug === filters.category)
  const q = filters.q?.replace(/[,()]/g, " ").trim()

  let query = supabase
    .from("equipment")
    .select(
      "*, categories(name, slug), equipment_images(public_url, alt_text, position), owner:profiles!equipment_owner_id_fkey(full_name, company_name, location, phone)"
    )
    .eq("status", "active")

  if (q) {
    query = query.or(`title.ilike.%${q}%,description.ilike.%${q}%,location.ilike.%${q}%`)
  }

  if (category) query = query.eq("category_id", category.id)
  if (filters.condition) query = query.eq("condition", filters.condition)
  if (filters.location) query = query.ilike("location", `%${filters.location}%`)
  if (filters.min) query = query.gte("price_per_hour", Number(filters.min))
  if (filters.max) query = query.lte("price_per_hour", Number(filters.max))

  if (filters.sort === "price_asc") {
    query = query.order("price_per_hour", { ascending: true })
  } else if (filters.sort === "price_desc") {
    query = query.order("price_per_hour", { ascending: false })
  } else {
    query = query.order("created_at", { ascending: false })
  }

  if (limit) query = query.limit(limit)

  const { data } = await query
  return (data ?? []).map(sortImages) as EquipmentCardRecord[]
}

export async function getEquipmentById(id: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from("equipment")
    .select(
      "*, categories(name, slug), equipment_images(public_url, alt_text, position), availability_rules(*), owner:profiles!equipment_owner_id_fkey(full_name, company_name, location, phone, avatar_url)"
    )
    .eq("id", id)
    .single()

  if (!data) return null
  return sortImages(data) as EquipmentDetailRecord
}

export async function getRelatedEquipment(equipment: EquipmentDetailRecord) {
  const supabase = await createClient()
  const { data } = await supabase
    .from("equipment")
    .select(
      "*, categories(name, slug), equipment_images(public_url, alt_text, position), owner:profiles!equipment_owner_id_fkey(full_name, company_name, location, phone)"
    )
    .eq("status", "active")
    .eq("category_id", equipment.category_id ?? "")
    .neq("id", equipment.id)
    .limit(3)

  return (data ?? []).map(sortImages) as EquipmentCardRecord[]
}

export async function getOwnerEquipment() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return []

  const { data } = await supabase
    .from("equipment")
    .select("*, categories(name, slug), equipment_images(public_url, alt_text, position)")
    .eq("owner_id", user.id)
    .order("created_at", { ascending: false })

  return (data ?? []).map(sortImages) as EquipmentCardRecord[]
}

export async function getEquipmentForEdit(id: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from("equipment")
    .select("*, categories(name, slug), equipment_images(public_url, alt_text, position), availability_rules(*)")
    .eq("id", id)
    .single()

  if (!data) return null
  return sortImages(data) as EquipmentDetailRecord
}

export async function getBookingsForUser() {
  const supabase = await createClient()
  const { data } = await supabase
    .from("bookings")
    .select(
      "*, equipment(title, location, price_per_hour, equipment_images(public_url, position)), owner:profiles!bookings_owner_id_fkey(full_name, company_name, phone), renter:profiles!bookings_renter_id_fkey(full_name, company_name, phone)"
    )
    .order("created_at", { ascending: false })

  return (data ?? []) as BookingRecord[]
}

function sortImages<T extends { equipment_images?: { position: number | null }[] }>(record: T) {
  return {
    ...record,
    equipment_images: [...(record.equipment_images ?? [])].sort(
      (a, b) => (a.position ?? 0) - (b.position ?? 0)
    ),
  }
}
