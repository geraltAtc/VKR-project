import { NextResponse } from 'next/server'; 
import { mockTravelData } from '@/lib/mockTravelData'; 
import type { WeatherForecast } from '@/types/travel'; 
 
interface OpenWeatherForecastItem { 
  dt: number; 
  main: { temp: number }; 
  weather: { description: string }[]; 
  wind?: { speed: number }; 
  pop?: number; 
} 
 
interface OpenWeatherForecastResponse { 
  list: OpenWeatherForecastItem[]; 
  city?: { name?: string }; 
} 
 
function mapOpenWeather(payload: OpenWeatherForecastResponse, fallbackLabel: string): WeatherForecast { 
  const rawList = payload.list ? payload.list : []; 
  const chosen = rawList.slice(0, 5); 
  const days = chosen.map(function (item) { 
    return { 
      date: new Date(item.dt * 1000).toISOString().slice(0, 10), 
      temperatureDay: Math.round(item.main.temp), 
      temperatureNight: Math.round(item.main.temp - 3), 
      description: item.weather[0] ? item.weather[0].description : 'No data', 
      windSpeed: Math.round(item.wind ? item.wind.speed : 0), 
      precipitationProbability: Math.round((item.pop ? item.pop : 0) * 100), 
    }; 
  }); 
 
  return { 
    locationLabel: payload.city ? (payload.city.name ? payload.city.name : fallbackLabel) : fallbackLabel, 
    days: days, 
  }; 
}
 
async function fetchOpenWeather(lat: number, lng: number): Promise<WeatherForecast | null> { 
  const apiKey = (process.env.OPENWEATHER_API_KEY ? process.env.OPENWEATHER_API_KEY : '').trim(); 
  if (!apiKey) return null; 
 
  const url = new URL('https://api.openweathermap.org/data/2.5/forecast'); 
  url.searchParams.set('lat', String(lat)); 
  url.searchParams.set('lon', String(lng)); 
  url.searchParams.set('appid', apiKey); 
  url.searchParams.set('units', 'metric'); 
  url.searchParams.set('lang', 'ru'); 
 
  const response = await fetch(url, { next: { revalidate: 60 * 30 } }); 
  if (!response.ok) { 
    throw new Error(`OpenWeather error: ${response.status}`); 
  } 
 
  const payload = (await response.json()) as OpenWeatherForecastResponse; 
  return mapOpenWeather(payload, 'Tour location'); 
} 
 
function buildLocalMock(lat: number, lng: number): WeatherForecast { 
  return { 
    locationLabel: `${lat.toFixed(2)}, ${lng.toFixed(2)}`, 
    days: [ 
      { 
        date: new Date().toISOString().slice(0, 10), 
        temperatureDay: 21, 
        temperatureNight: 14, 
        description: 'Clear', 
        windSpeed: 3, 
        precipitationProbability: 10, 
      }, 
      { 
        date: new Date(Date.now() + 86400000).toISOString().slice(0, 10), 
        temperatureDay: 19, 
        temperatureNight: 13, 
        description: 'Cloudy', 
        windSpeed: 4, 
        precipitationProbability: 30, 
      }, 
    ], 
  }; 
}
 
export async function GET(request: Request) { 
  const searchParams = new URL(request.url).searchParams; 
  const lat = Number(searchParams.get('lat')); 
  const lng = Number(searchParams.get('lng')); 
  const tourId = searchParams.get('tourId'); 
 
  if (Number.isNaN(lat)) { 
    return NextResponse.json({ message: 'lat is required.' }, { status: 400 }); 
  } 
 
  if (Number.isNaN(lng)) { 
    return NextResponse.json({ message: 'lng is required.' }, { status: 400 }); 
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
    console.error('Weather API failed:', error); 
  } 
 
  return NextResponse.json(buildLocalMock(lat, lng)); 
}
