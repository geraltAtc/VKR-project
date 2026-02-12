import { NextResponse } from "next/server";

interface Tour {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  duration: string;
  location: string;
  rating?: number;
  lat?: number;
  lng?: number;
}

const MOCK_TOURS: Tour[] = [
  {
    id: "paris-5",
    name: "Париж: 5 дней романтики",
    description: "Классический городской тур с посещением Эйфелевой башни и Лувра.",
    price: 1200,
    image: "https://images.pexels.com/photos/338515/pexels-photo-338515.jpeg",
    duration: "5 дней",
    location: "Париж, Франция",
    rating: 5,
    lat: 48.8566,
    lng: 2.3522,
  },
  {
    id: "bali-7",
    name: "Бали: 7 дней на океане",
    description: "Пляжный отдых, серфинг и тропические закаты.",
    price: 1500,
    image: "https://images.pexels.com/photos/258154/pexels-photo-258154.jpeg",
    duration: "7 дней",
    location: "Бали, Индонезия",
    rating: 4.8,
    lat: -8.3405,
    lng: 115.092,
  },
  {
    id: "alps-3",
    name: "Альпы: 3 дня в горах",
    description: "Горнолыжный уикенд с панорамными видами.",
    price: 800,
    image: "https://images.pexels.com/photos/358046/pexels-photo-358046.jpeg",
    duration: "3 дня",
    location: "Шамони, Франция",
    rating: 4.5,
    lat: 45.9237,
    lng: 6.8694,
  },
];

export async function GET() {
  return NextResponse.json(MOCK_TOURS);
}

