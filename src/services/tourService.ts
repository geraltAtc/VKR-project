// API сервис для работы с турами

interface Tour {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  duration: string;
  location: string;
  rating?: number;
}

class TourService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_API_URL || "/api";
  }

  /**
   * Получить список всех туров
   */
  async getAllTours(): Promise<Tour[]> {
    try {
      const response = await fetch(`${this.baseUrl}/tours`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Failed to fetch tours:", error);
      throw error;
    }
  }

  /**
   * Получить тур по ID
   */
  async getTourById(id: string): Promise<Tour> {
    try {
      const response = await fetch(`${this.baseUrl}/tours/${id}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error(`Failed to fetch tour with id ${id}:`, error);
      throw error;
    }
  }

  /**
   * Похожие туры
   */
  async getSimilarTours(tourId: string): Promise<Tour[]> {
    try {
      const response = await fetch(`${this.baseUrl}/tours/${tourId}/similar`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error(`Failed to fetch similar tours:`, error);
      throw error;
    }
  }

  /**
   * Поиск туров
   */
  async searchTours(query: string): Promise<Tour[]> {
    try {
      const response = await fetch(`${this.baseUrl}/tours/search`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query }),
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Failed to search tours:", error);
      throw error;
    }
  }
}

export const tourService = new TourService();
