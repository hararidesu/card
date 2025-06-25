export interface Card {
  id: string
  store_name: string
  member_number: string
  barcode?: string
  qr_code?: string
  phone_number?: string
  url?: string
  front_image: string
  back_image?: string
  created_at: Date
  updated_at: Date
}