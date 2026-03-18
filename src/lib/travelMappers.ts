import type {
  Attraction,
  ChecklistItem,
  CountryInfo,
  TourDetails,
  TourSummary,
} from "@/types/travel";

interface TourRow {
  id: string;
  title: string;
  city: string;
  country: string;
  start_date: string;
  end_date: string;
  hotel_name: string;
  hotel_address: string;
  hotel_lat: number | null;
  hotel_lng: number | null;
  hotel_phone?: string | null;
  check_in_time?: string | null;
  check_out_time?: string | null;
  room_details?: string | null;
  transfer_details?: string | null;
  emergency_phone?: string | null;
  operator_phone?: string | null;
}

interface AttractionRow {
  id: string;
  tour_id: string;
  name: string;
  address: string;
  lat: number | null;
  lng: number | null;
  working_hours: string | null;
  entry_price: string | null;
  visit_duration: string | null;
  description: string | null;
  tips: string | null;
  category: string | null;
}

interface CountryInfoRow {
  tour_id: string;
  currency_info: string | null;
  language_info: string | null;
  transport_info: string | null;
  climate_info: string | null;
  food_info: string | null;
  safety_info: string | null;
  culture_info: string | null;
  useful_contacts: string | null;
}

interface ChecklistRow {
  id: string;
  tour_id: string;
  category: string;
  title: string;
  note: string | null;
  is_required: boolean | null;
}

export const mapTourSummary = (row: TourRow): TourSummary => ({
  id: row.id,
  title: row.title,
  city: row.city,
  country: row.country,
  startDate: row.start_date,
  endDate: row.end_date,
  hotelName: row.hotel_name,
  hotelAddress: row.hotel_address,
  hotelLat: row.hotel_lat ?? 0,
  hotelLng: row.hotel_lng ?? 0,
});

export const mapTourDetails = (
  row: TourRow,
  attractions: Attraction[],
  countryInfo: CountryInfo | null,
  checklistItems: ChecklistItem[],
): TourDetails => ({
  ...mapTourSummary(row),
  hotelPhone: row.hotel_phone ?? "",
  checkInTime: row.check_in_time ?? "",
  checkOutTime: row.check_out_time ?? "",
  roomDetails: row.room_details ?? "",
  transferDetails: row.transfer_details ?? "",
  emergencyPhone: row.emergency_phone ?? "",
  operatorPhone: row.operator_phone ?? "",
  attractions,
  countryInfo,
  checklistItems,
});

export const mapAttraction = (row: AttractionRow): Attraction => ({
  id: row.id,
  tourId: row.tour_id,
  name: row.name,
  address: row.address,
  lat: row.lat ?? 0,
  lng: row.lng ?? 0,
  workingHours: row.working_hours ?? "",
  entryPrice: row.entry_price ?? "",
  visitDuration: row.visit_duration ?? "",
  description: row.description ?? "",
  tips: row.tips ?? "",
  category: row.category ?? "Другое",
});

export const mapCountryInfo = (row: CountryInfoRow): CountryInfo => ({
  tourId: row.tour_id,
  currencyInfo: row.currency_info ?? "",
  languageInfo: row.language_info ?? "",
  transportInfo: row.transport_info ?? "",
  climateInfo: row.climate_info ?? "",
  foodInfo: row.food_info ?? "",
  safetyInfo: row.safety_info ?? "",
  cultureInfo: row.culture_info ?? "",
  usefulContacts: row.useful_contacts ?? "",
});

export const mapChecklistItem = (row: ChecklistRow): ChecklistItem => ({
  id: row.id,
  tourId: row.tour_id,
  category: row.category,
  title: row.title,
  note: row.note ?? "",
  required: Boolean(row.is_required),
});
