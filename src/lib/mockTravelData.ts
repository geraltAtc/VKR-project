import type {
  Attraction,
  ChecklistItem,
  CountryInfo,
  TourDetails,
  TourSummary,
  WeatherForecast,
} from "@/types/travel";

const tours: TourDetails[] = [
  {
    id: "barcelona-hotel",
    title: "Барселона: городской отпуск 7 дней",
    city: "Барселона",
    country: "Испания",
    startDate: "2026-04-12",
    endDate: "2026-04-19",
    hotelName: "Hotel Barcelona Center",
    hotelAddress: "Paseo de Gracia, 25, Barcelona",
    hotelLat: 41.3917,
    hotelLng: 2.1649,
    hotelPhone: "+34 93 XXX XXX",
    checkInTime: "15:00",
    checkOutTime: "12:00",
    roomDetails: "Стандартный номер, завтрак включен, Wi-Fi бесплатно.",
    transferDetails:
      "Встреча в зале прилета с табличкой Hotel Barcelona Center. Время в пути 20-30 минут.",
    emergencyPhone: "+34 93 XXX XXX",
    operatorPhone: "+7 999 123-45-67",
    attractions: [
      {
        id: "sagrada-familia",
        tourId: "barcelona-hotel",
        name: "Саграда Фамилия",
        address: "Carrer de Mallorca, 401, Barcelona",
        lat: 41.4036,
        lng: 2.1744,
        workingHours: "09:00 - 20:00",
        entryPrice: "€26",
        visitDuration: "1.5-2 часа",
        description:
          "Собор Антонио Гауди и одна из главных достопримечательностей Испании.",
        tips: "Лучше приезжать к открытию, чтобы избежать длинных очередей.",
        category: "Архитектура",
      },
      {
        id: "park-guell",
        tourId: "barcelona-hotel",
        name: "Парк Гуэль",
        address: "Carrer d'Olot, 7, Barcelona",
        lat: 41.4145,
        lng: 2.1527,
        workingHours: "09:30 - 19:30",
        entryPrice: "€13",
        visitDuration: "1-2 часа",
        description: "Парк с панорамным видом на город и мозаиками Гауди.",
        tips: "Берите воду и удобную обувь: в парке много подъемов.",
        category: "Парк",
      },
      {
        id: "la-rambla",
        tourId: "barcelona-hotel",
        name: "Ла Рамбла",
        address: "La Rambla, Barcelona",
        lat: 41.3809,
        lng: 2.1731,
        workingHours: "Круглосуточно",
        entryPrice: "Бесплатно",
        visitDuration: "1 час",
        description:
          "Главная прогулочная улица города с кафе, артистами и рынком Бокерия.",
        tips: "Следите за вещами, особенно в вечернее время.",
        category: "Прогулка",
      },
    ],
    countryInfo: {
      tourId: "barcelona-hotel",
      currencyInfo:
        "Валюта EUR. Банкоматы доступны почти везде. Чаевые 5-10% по желанию.",
      languageInfo:
        "Официальный язык испанский. В туристических местах часто понимают английский.",
      transportInfo:
        "Метро ~€2.55 за поездку. Автобус ~€2.15. Такси от €10, удобно ночью.",
      climateInfo:
        "В апреле обычно +15...+22°C, возможен дождь. Возьмите легкую куртку.",
      foodInfo:
        "Обед в Испании поздний (13:00-15:00), ужин часто после 20:00.",
      safetyInfo:
        "Не оставляйте ценные вещи на виду. Избегайте пустых улиц поздно вечером.",
      cultureInfo:
        "Испанцы ценят вежливость и неформальное общение. В храмах соблюдайте дресс-код.",
      usefulContacts:
        "Консульство РФ в Барселоне: +34 93 280 92 42. Страховая: +7 800 000 00 00.",
    },
    checklistItems: [
      {
        id: "passport",
        tourId: "barcelona-hotel",
        category: "Документы",
        title: "Паспорт (срок действия более 6 месяцев)",
        note: "",
        required: true,
      },
      {
        id: "tickets",
        tourId: "barcelona-hotel",
        category: "Документы",
        title: "Билеты и ваучер отеля",
        note: "Распечатка или офлайн-копия на телефоне",
        required: true,
      },
      {
        id: "insurance",
        tourId: "barcelona-hotel",
        category: "Документы",
        title: "Страховой полис",
        note: "Сохраните номер страховой в контактах",
        required: true,
      },
      {
        id: "jacket",
        tourId: "barcelona-hotel",
        category: "Одежда",
        title: "Легкая куртка",
        note: "Для вечера и возможного дождя",
        required: true,
      },
      {
        id: "sneakers",
        tourId: "barcelona-hotel",
        category: "Одежда",
        title: "Удобные кроссовки",
        note: "Для пеших прогулок по городу",
        required: true,
      },
      {
        id: "charger",
        tourId: "barcelona-hotel",
        category: "Электроника",
        title: "Зарядка для телефона и powerbank",
        note: "",
        required: true,
      },
      {
        id: "cash",
        tourId: "barcelona-hotel",
        category: "Финансы",
        title: "Наличные EUR",
        note: "Рекомендуемый запас 100-300 EUR",
        required: false,
      },
    ],
  },
  {
    id: "istanbul-city",
    title: "Стамбул: культурный маршрут 5 дней",
    city: "Стамбул",
    country: "Турция",
    startDate: "2026-05-05",
    endDate: "2026-05-10",
    hotelName: "Golden Horn Hotel",
    hotelAddress: "Hobyar, Ankara Cd. No:59, Istanbul",
    hotelLat: 41.0178,
    hotelLng: 28.9736,
    hotelPhone: "+90 212 XXX XX XX",
    checkInTime: "14:00",
    checkOutTime: "12:00",
    roomDetails: "Номер standard + завтрак. Трансфер групповой.",
    transferDetails:
      "Представитель принимающей стороны встречает после зоны выдачи багажа.",
    emergencyPhone: "+90 212 XXX XX XX",
    operatorPhone: "+7 999 555-22-11",
    attractions: [],
    countryInfo: null,
    checklistItems: [],
  },
];

const weatherByTour: Record<string, WeatherForecast> = {
  "barcelona-hotel": {
    locationLabel: "Барселона",
    days: [
      {
        date: "2026-04-12",
        temperatureDay: 20,
        temperatureNight: 14,
        description: "Переменная облачность",
        windSpeed: 4,
        precipitationProbability: 20,
      },
      {
        date: "2026-04-13",
        temperatureDay: 21,
        temperatureNight: 15,
        description: "Солнечно",
        windSpeed: 3,
        precipitationProbability: 10,
      },
      {
        date: "2026-04-14",
        temperatureDay: 19,
        temperatureNight: 13,
        description: "Кратковременный дождь",
        windSpeed: 5,
        precipitationProbability: 55,
      },
    ],
  },
};

export const mockTravelData = {
  getTourSummaries(): TourSummary[] {
    return tours.map((tour) => ({
      id: tour.id,
      title: tour.title,
      city: tour.city,
      country: tour.country,
      startDate: tour.startDate,
      endDate: tour.endDate,
      hotelName: tour.hotelName,
      hotelAddress: tour.hotelAddress,
      hotelLat: tour.hotelLat,
      hotelLng: tour.hotelLng,
    }));
  },

  getTourById(id: string): TourDetails | null {
    return tours.find((tour) => tour.id === id) ?? null;
  },

  getAttractionsByTourId(tourId: string): Attraction[] {
    const tour = tours.find((item) => item.id === tourId);
    return tour?.attractions ?? [];
  },

  getCountryInfoByTourId(tourId: string): CountryInfo | null {
    const tour = tours.find((item) => item.id === tourId);
    return tour?.countryInfo ?? null;
  },

  getChecklistItemsByTourId(tourId: string): ChecklistItem[] {
    const tour = tours.find((item) => item.id === tourId);
    return tour?.checklistItems ?? [];
  },

  getWeatherByTourId(tourId: string): WeatherForecast | null {
    return weatherByTour[tourId] ?? null;
  },
};

