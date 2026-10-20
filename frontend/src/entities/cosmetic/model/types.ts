export interface CosmeticType {
  id: number;
  name: string;
  alias: "cape" | "hat" | "wings";
}

export interface CosmeticItem {
  id: number;
  name: string;
  type_id: number;
  price: string; // Laravel decimal возвращает строкой
  image_url: string;
  type: CosmeticType;
}

// Laravel пагинация
export interface PaginatedResponse<T> {
  data: T[];
  current_page: number;
  last_page: number;
  total: number;
}
