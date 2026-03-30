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
  id?: string;
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
  id?: string;
  tourId: string;
  category: string;
  title: string;
  note: string;
  required: boolean;
}

class TourService {
  private readonly baseUrl: string;
  private readonly cacheKeys = {
    tours: "lite.travel:cache:tours:v1",
    tourPrefix: "lite.travel:cache:tour:v1:",
    weatherPrefix: "lite.travel:cache:weather:v1:",
  };

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_API_URL || "/api";
  }

  private readCache<T>(key: string): T | null {
    if (typeof window === "undefined") return null;
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return null;
      return JSON.parse(raw) as T;
    } catch {
      return null;
    }
  }

  private writeCache<T>(key: string, value: T): void {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Ignore write failures (quota, private mode, etc).
    }
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
    try {
      const tours = await this.request<TourSummary[]>("/tours");
      this.writeCache(this.cacheKeys.tours, tours);
      return tours;
    } catch (error) {
      const cached = this.readCache<TourSummary[]>(this.cacheKeys.tours);
      if (cached) return cached;
      throw error;
    }
  }

  async getTourById(id: string): Promise<TourDetails> {
    const cacheKey = `${this.cacheKeys.tourPrefix}${id}`;
    try {
      const tour = await this.request<TourDetails>(`/tours/${id}`);
      this.writeCache(cacheKey, tour);
      return tour;
    } catch (error) {
      const cached = this.readCache<TourDetails>(cacheKey);
      if (cached) return cached;
      throw error;
    }
  }

  async getWeather(lat: number, lng: number, tourId?: string) {
    const params = new URLSearchParams({
      lat: String(lat),
      lng: String(lng),
    });

    if (tourId) {
      params.set("tourId", tourId);
    }
    const keyPart = tourId || `${lat.toFixed(4)},${lng.toFixed(4)}`;
    const cacheKey = `${this.cacheKeys.weatherPrefix}${keyPart}`;
    try {
      const weather = await this.request<WeatherForecast>(
        `/weather?${params.toString()}`,
      );
      this.writeCache(cacheKey, weather);
      return weather;
    } catch (error) {
      const cached = this.readCache<WeatherForecast>(cacheKey);
      if (cached) return cached;
      throw error;
    }
  }

  async adminLogin(token: string) {
    return this.request<{ message: string }>("/admin/login", {
      method: "POST",
      body: JSON.stringify({ token }),
      credentials: "same-origin",
    });
  }

  async adminLogout() {
    return this.request<{ message: string }>("/admin/logout", {
      method: "POST",
      credentials: "same-origin",
    });
  }

  async createTour(payload: AdminTourPayload) {
    return this.request<{ id: string; message: string }>("/admin/tours", {
      method: "POST",
      credentials: "same-origin",
      body: JSON.stringify(payload),
    });
  }

  async deleteTour(id: string) {
    return this.request<{ message: string }>("/admin/tours", {
      method: "DELETE",
      credentials: "same-origin",
      body: JSON.stringify({ id }),
    });
  }

  async createAttraction(payload: AdminAttractionPayload) {
    return this.request<{ id: string; message: string }>("/admin/attractions", {
      method: "POST",
      credentials: "same-origin",
      body: JSON.stringify(payload),
    });
  }

  async deleteAttraction(id: string) {
    return this.request<{ message: string }>(`/admin/attractions/${id}`, {
      method: "DELETE",
      credentials: "same-origin",
    });
  }

  async upsertCountryInfo(payload: AdminCountryInfoPayload) {
    return this.request<{ message: string }>("/admin/country-info", {
      method: "POST",
      credentials: "same-origin",
      body: JSON.stringify(payload),
    });
  }

  async createChecklistItem(payload: AdminChecklistPayload) {
    return this.request<{ id: string; message: string }>("/admin/checklist", {
      method: "POST",
      credentials: "same-origin",
      body: JSON.stringify(payload),
    });
  }

  async deleteChecklistItem(id: string) {
    return this.request<{ message: string }>(`/admin/checklist/${id}`, {
      method: "DELETE",
      credentials: "same-origin",
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
