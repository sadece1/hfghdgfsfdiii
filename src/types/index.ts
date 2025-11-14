export interface Car {
  id: string;
  title: string;
  brand: string;
  model: string;
  price: number;
  year: number;
  mileage: number;
  fuel: 'Benzin' | 'Dizel' | 'Elektrik' | 'Hibrit';
  transmission: 'Manuel' | 'Otomatik' | 'Yarı Otomatik';
  location: string;
  sellerType: 'Sahibinden' | 'Galeriden';
  images: string[];
  description: string;
  technicalSpecs: {
    engine: string;
    power: string;
    torque: string;
    acceleration: string;
    topSpeed: string;
    fuelConsumption: string;
  };
  features: string[];
  safety: string[];
  isNew: boolean;
  createdAt: string;
}

export interface Grader {
  id: string;
  title: string;
  brand?: string;
  model?: string;
  price: number;
  year: number;
  operatingHours: number;
  fuel: string;
  transmission: string;
  location: string;
  sellerType: string;
  images: string[];
  description: string;
  technicalSpecs: {
    engine: string;
    power: string;
    torque: string;
    bladeWidth: string;
    operatingWeight: string;
    fuelConsumption: string;
  };
  features: string[];
  safety: string[];
  isNew: boolean;
  isSold: boolean;
  createdAt: string;
  listingDate: string; // İlana koyma tarihi
  stockCountry: 'EU' | 'Kenya' | 'US'; // Stok ülkesi
}

export interface Part {
  id: string;
  title: string;
  brand: string;
  category: string;
  price: number;
  partNumber: string;
  compatibleModels: string[];
  images: string[];
  description: string;
  specifications: {
    material: string;
    dimensions: string;
    weight: string;
    warranty: string;
  };
  isNew: boolean;
  isSold: boolean;
  createdAt: string;
  listingDate: string; // İlana koyma tarihi
  stockCountry: 'EU' | 'Kenya' | 'US'; // Stok ülkesi
  stockQuantity: number; // Stok miktarı
}

export interface User {
  id: string;
  username: string;
  email: string;
  role: 'user' | 'admin';
}

export interface FilterState {
  brand: string[];
  price: { min: number; max: number };
  category: string[];
  stockCountry: string[]; // Stok ülkesi filtresi
  saleStatus: string[]; // Satış durumu filtresi (Satılık, Satılmış)
}

export interface HomepageSliderItem {
  id: string;
  type: 'grader' | 'part';
  graderId?: string;
  partId?: string;
  order: number;
  isActive: boolean;
}

export interface AppState {
  graders: Grader[];
  parts: Part[];
  user: User | null;
  filters: FilterState;
  isLoading: boolean;
  homepageSlider: HomepageSliderItem[];
  favorites: string[];
}

export interface AppActions {
  setGraders: (graders: Grader[]) => void;
  addGrader: (grader: Grader) => void;
  updateGrader: (grader: Grader) => void;
  deleteGrader: (id: string) => void;
  setParts: (parts: Part[]) => void;
  addPart: (part: Part) => void;
  updatePart: (part: Part) => void;
  deletePart: (id: string) => void;
  setUser: (user: User | null) => void;
  setFilters: (filters: Partial<FilterState>) => void;
  clearFilters: () => void;
  setLoading: (loading: boolean) => void;
  setHomepageSlider: (items: HomepageSliderItem[]) => void;
  addHomepageSliderItem: (item: HomepageSliderItem) => void;
  updateHomepageSliderItem: (item: HomepageSliderItem) => void;
  deleteHomepageSliderItem: (id: string) => void;
  saveHomepageSlider: () => void;
  toggleFavorite: (id: string) => void;
}
