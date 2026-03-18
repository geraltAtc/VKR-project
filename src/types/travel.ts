export interface TourSummary {
  id: string;
  title: string;
  city: string;
  country: string;
  startDate: string;
  endDate: string;
  hotelName: string;
  hotelAddress: string;
  hotelLat: number;
  hotelLng: number;
}

export interface CountryInfo {
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

export interface Attraction {
  id: string;
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

export interface ChecklistItem {
  id: string;
  tourId: string;
  category: string;
  title: string;
  note: string;
  required: boolean;
}

export interface TourDetails extends TourSummary {
  hotelPhone: string;
  checkInTime: string;
  checkOutTime: string;
  roomDetails: string;
  transferDetails: string;
  emergencyPhone: string;
  operatorPhone: string;
  attractions: Attraction[];
  countryInfo: CountryInfo | null;
  checklistItems: ChecklistItem[];
}

export interface WeatherDay {
  date: string;
  temperatureDay: number;
  temperatureNight: number;
  description: string;
  windSpeed: number;
  precipitationProbability: number;
}

export interface WeatherForecast {
  locationLabel: string;
  days: WeatherDay[];
}

