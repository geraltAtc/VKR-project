import type {
  Attraction,
  ChecklistItem,
  CountryInfo,
  TourDetails,
  TourSummary,
  WeatherForecast,
} from "@/types/travel";

interface AdminTourPayload {
  id: string;
  title: string;
  city: string;
  country: string;
  startDate: string;
  endDate: string;
  hotelName: string;
  hotelAddress: string;
  hotelPhone: string;
  checkInTime: string;
  checkOutTime: string;
  roomDetails: string;
  transferDetails: string;
  emergencyPhone: string;
  operatorPhone: string;
  hotelLat: number;
  hotelLng: number;
}

interface AdminAttractionPayload {
  tourId: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  workingHours: string;
  entryPrice: string;
  visitDuration: string;
  description: string;
  tips: string;
  category: string;
}

interface AdminCountryInfoPayload {
  tourId: string;
  currencyInfo: string;
  languageInfo: string;
  transportInfo: string;
  climateInfo: string;
  foodInfo: string;
  safetyInfo: string;
  cultureInfo: string;
  usefulContacts: string;
}

interface AdminChecklistPayload {
  tourId: string;
  category: string;
  title: string;
  note: string;
  required: boolean;
}

class TourService {
  private readonly baseUrl: string;

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_API_URL || "/api";
  }

  private async request<T>(path: string, init?: RequestInit): Promise<T> {
    const response = await fetch(`${this.baseUrl}${path}`, {
      headers: {
        "Content-Type": "application/json",
        ...(init?.headers ?? {}),
      },
      ...init,
    });

    if (!response.ok) {
      const message = await response.text();
      throw new Error(message || `HTTP ${response.status}`);
    }

    return (await response.json()) as T;
  }

  async getAllTours(): Promise<TourSummary[]> {
    return this.request<TourSummary[]>("/tours");
  }

  async getTourById(id: string): Promise<TourDetails> {
    return this.request<TourDetails>(`/tours/${id}`);
  }

  async getWeather(lat: number, lng: number, tourId?: string) {
    const params = new URLSearchParams({
      lat: String(lat),
      lng: String(lng),
    });

    if (tourId) {
      params.set("tourId", tourId);
    }

    return this.request<WeatherForecast>(`/weather?${params.toString()}`);
  }

  async createTour(payload: AdminTourPayload, token: string) {
    return this.request<{ id: string; message: string }>("/admin/tours", {
      method: "POST",
      headers: { "x-admin-token": token },
      body: JSON.stringify(payload),
    });
  }

  async createAttraction(payload: AdminAttractionPayload, token: string) {
    return this.request<{ id: string; message: string }>("/admin/attractions", {
      method: "POST",
      headers: { "x-admin-token": token },
      body: JSON.stringify(payload),
    });
  }

  async upsertCountryInfo(payload: AdminCountryInfoPayload, token: string) {
    return this.request<{ message: string }>("/admin/country-info", {
      method: "POST",
      headers: { "x-admin-token": token },
      body: JSON.stringify(payload),
    });
  }

  async createChecklistItem(payload: AdminChecklistPayload, token: string) {
    return this.request<{ id: string; message: string }>("/admin/checklist", {
      method: "POST",
      headers: { "x-admin-token": token },
      body: JSON.stringify(payload),
    });
  }

  // Возвращает пустые структуры, удобно для UI с optimistic flow.
  static emptyCollections: {
    attractions: Attraction[];
    checklistItems: ChecklistItem[];
    countryInfo: CountryInfo | null;
  } = {
    attractions: [],
    checklistItems: [],
    countryInfo: null,
  };
}

export const tourService = new TourService();

