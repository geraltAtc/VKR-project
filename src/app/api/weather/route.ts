import { NextResponse } from "next/server";
import { mockTravelData } from "@/lib/mockTravelData";
import type { WeatherForecast } from "@/types/travel";

interface OpenWeatherForecastItem {
  dt: number;
  temp: {
    day: number;
    night: number;
  };
  weather: Array<{ description: string }>;
  wind_speed: number;
  pop: number;
}

interface OpenWeatherForecastResponse {
  list: OpenWeatherForecastItem[];
  city?: {
    name?: string;
  };
}

const mapOpenWeather = (
  payload: OpenWeatherForecastResponse,
  fallbackLabel: string,
): WeatherForecast => ({
  locationLabel: payload.city?.name || fallbackLabel,
  days: (payload.list ?? []).slice(0, 5).map((item) => ({
    date: new Date(item.dt * 1000).toISOString().slice(0, 10),
    temperatureDay: Math.round(item.temp.day),
    temperatureNight: Math.round(item.temp.night),
    description: item.weather[0]?.description ?? "Нет данных",
    windSpeed: Math.round(item.wind_speed),
    precipitationProbability: Math.round((item.pop ?? 0) * 100),
  })),
});

const fetchOpenWeather = async (
  lat: number,
  lng: number,
): Promise<WeatherForecast | null> => {
  const apiKey = process.env.OPENWEATHER_API_KEY;
  if (!apiKey) return null;

  const url = new URL("https://api.openweathermap.org/data/2.5/forecast/daily");
  url.searchParams.set("lat", String(lat));
  url.searchParams.set("lon", String(lng));
  url.searchParams.set("appid", apiKey);
  url.searchParams.set("units", "metric");
  url.searchParams.set("lang", "ru");
  url.searchParams.set("cnt", "5");

  const response = await fetch(url, { next: { revalidate: 60 * 30 } });
  if (!response.ok) {
    throw new Error(`OpenWeather error: ${response.status}`);
  }

  const payload = (await response.json()) as OpenWeatherForecastResponse;
  return mapOpenWeather(payload, "Ваше направление");
};

const buildLocalMock = (lat: number, lng: number): WeatherForecast => ({
  locationLabel: `${lat.toFixed(2)}, ${lng.toFixed(2)}`,
  days: [
    {
      date: new Date().toISOString().slice(0, 10),
      temperatureDay: 21,
      temperatureNight: 14,
      description: "Ясно",
      windSpeed: 3,
      precipitationProbability: 10,
    },
    {
      date: new Date(Date.now() + 86400000).toISOString().slice(0, 10),
      temperatureDay: 19,
      temperatureNight: 13,
      description: "Облачно",
      windSpeed: 4,
      precipitationProbability: 30,
    },
  ],
});

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const lat = Number(searchParams.get("lat"));
  const lng = Number(searchParams.get("lng"));
  const tourId = searchParams.get("tourId");

  if (Number.isNaN(lat) || Number.isNaN(lng)) {
    return NextResponse.json(
      { message: "Параметры lat и lng обязательны." },
      { status: 400 },
    );
  }

  if (tourId) {
    const fromMock = mockTravelData.getWeatherByTourId(tourId);
    if (fromMock) {
      return NextResponse.json(fromMock);
    }
  }

  try {
    const weather = await fetchOpenWeather(lat, lng);
    if (weather) {
      return NextResponse.json(weather);
    }
  } catch (error) {
    console.error("Weather API failed:", error);
  }

  return NextResponse.json(buildLocalMock(lat, lng));
}

