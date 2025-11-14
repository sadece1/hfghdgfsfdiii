import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AppState, AppActions, Grader, Part, FilterState, HomepageSliderItem } from '../types';

const defaultFilters: FilterState = {
  brand: [],
  price: { min: 0, max: 50000000 },
  category: [],
  stockCountry: [], // Stok ülkesi filtresi
  saleStatus: [], // Satış durumu filtresi
};

// Simplified mock data for better performance
const mockGraders: Grader[] = [
  {
    id: '1',
    title: '2020 Caterpillar 140M Grader',
    brand: 'Cat',
    model: '140M',
    price: 8500000,
    year: 2020,
    operatingHours: 2500,
    fuel: 'Dizel',
    transmission: 'Otomatik',
    location: 'İstanbul',
    sellerType: 'Bayiden',
    images: ['/rsm/Grader_2.jpg'],
    description: 'Tek elden, bakımlı, kazasız Caterpillar 140M grader.',
    technicalSpecs: {
      engine: 'Cat C7.1 ACERT',
      power: '205 HP',
      torque: '850 Nm',
      bladeWidth: '3.7m',
      operatingWeight: '15,200 kg',
      fuelConsumption: '25L/saat',
    },
    features: ['Klima', 'ABS', 'ESP'],
    safety: ['ABS', 'ESP'],
    isNew: true,
    isSold: false,
    createdAt: new Date().toISOString(),
    listingDate: new Date().toISOString(),
    stockCountry: 'EU',
  },
  {
    id: '2',
    title: '2019 Komatsu GD655-7 Grader',
    brand: 'Komatsu',
    model: 'GD655-7',
    price: 7200000,
    year: 2019,
    operatingHours: 3200,
    fuel: 'Dizel',
    transmission: 'Otomatik',
    location: 'Ankara',
    sellerType: 'Sahibinden',
    images: ['/rsm/Grader02.jpg'],
    description: 'Komatsu GD655-7 grader, full paket.',
    technicalSpecs: {
      engine: 'Komatsu SAA6D107E-3',
      power: '190 HP',
      torque: '780 Nm',
      bladeWidth: '3.7m',
      operatingWeight: '14,800 kg',
      fuelConsumption: '22L/saat',
    },
    features: ['Klima', 'ABS', 'ESP'],
    safety: ['ABS', 'ESP'],
    isNew: false,
    isSold: false,
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    listingDate: new Date(Date.now() - 86400000).toISOString(),
    stockCountry: 'Kenya',
  },
  {
    id: '3',
    title: '2021 Caterpillar 160M Grader',
    brand: 'Cat',
    model: '160M',
    price: 12500000,
    year: 2021,
    operatingHours: 1800,
    fuel: 'Dizel',
    transmission: 'Otomatik',
    location: 'İzmir',
    sellerType: 'Bayiden',
    images: ['/rsm/Grader_2.jpg'],
    description: 'Caterpillar 160M grader, az kullanılmış.',
    technicalSpecs: {
      engine: 'Cat C9.3 ACERT',
      power: '250 HP',
      torque: '1050 Nm',
      bladeWidth: '4.0m',
      operatingWeight: '18,500 kg',
      fuelConsumption: '30L/saat',
    },
    features: ['Klima', 'ABS', 'ESP'],
    safety: ['ABS', 'ESP'],
    isNew: true,
    isSold: true,
    createdAt: new Date(Date.now() - 172800000).toISOString(),
    listingDate: new Date(Date.now() - 172800000).toISOString(),
    stockCountry: 'US',
  },
];

// Updated part images from public/rsm/prc folder
const mockParts: Part[] = [
  {
    id: 'p1',
    title: 'Caterpillar Blade Edge',
    brand: 'Cat',
    category: 'Blade Parts',
    price: 15000,
    partNumber: '1R-0742',
    compatibleModels: ['140M', '160M', '120M'],
    images: [
      '/rsm/prc/catHydraulicPump.jfif',
    ],
    description: 'High-quality blade edge for Caterpillar graders.',
    specifications: {
      material: 'Hardened Steel',
      dimensions: '3.7m x 0.3m x 0.05m',
      weight: '45 kg',
      warranty: '12 months',
    },
    isNew: true,
    isSold: false,
    createdAt: new Date().toISOString(),
    listingDate: new Date().toISOString(),
    stockCountry: 'EU',
    stockQuantity: 15,
  },
  {
    id: 'p2',
    title: 'Komatsu Hydraulic Pump',
    brand: 'Komatsu',
    category: 'Hydraulic Parts',
    price: 45000,
    partNumber: '20Y-70-11100',
    compatibleModels: ['GD655-7', 'GD675-7', 'GD825-7'],
    images: [
      '/rsm/prc/catHydraulicPump2.jpg',
    ],
    description: 'Original Komatsu hydraulic pump for grader systems.',
    specifications: {
      material: 'Cast Iron',
      dimensions: '0.4m x 0.3m x 0.2m',
      weight: '85 kg',
      warranty: '24 months',
    },
    isNew: true,
    isSold: true,
    createdAt: new Date().toISOString(),
    listingDate: new Date().toISOString(),
    stockCountry: 'Kenya',
    stockQuantity: 8,
  },
  {
    id: 'p3',
    title: 'Caterpillar Hydraulic Pump',
    brand: 'Cat',
    category: 'Hydraulic Parts',
    price: 35000,
    partNumber: '1R-0743',
    compatibleModels: ['140M', '160M', '120M'],
    images: [
      '/rsm/prc/CM20230713-2a763-9a8ee.jfif',
    ],
    description: 'High-performance hydraulic pump for Caterpillar graders.',
    specifications: {
      material: 'Aluminum Alloy',
      dimensions: '0.5m x 0.4m x 0.3m',
      weight: '75 kg',
      warranty: '18 months',
    },
    isNew: false,
    isSold: false,
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    listingDate: new Date(Date.now() - 86400000).toISOString(),
    stockCountry: 'US',
    stockQuantity: 3,
  },
  {
    id: 'p4',
    title: 'Komatsu Engine Component',
    brand: 'Komatsu',
    category: 'Engine Parts',
    price: 28000,
    partNumber: '20Y-70-11101',
    compatibleModels: ['GD655-7', 'GD675-7'],
    images: [
      '/rsm/prc/CM20230720-ddef9-2793d.jfif',
    ],
    description: 'Essential engine component for Komatsu grader systems.',
    specifications: {
      material: 'Steel',
      dimensions: '0.3m x 0.2m x 0.15m',
      weight: '25 kg',
      warranty: '12 months',
    },
    isNew: true,
    isSold: false,
    createdAt: new Date(Date.now() - 172800000).toISOString(),
    listingDate: new Date(Date.now() - 172800000).toISOString(),
    stockCountry: 'EU',
    stockQuantity: 22,
  },
];

// Mock homepage slider data
const mockHomepageSlider: HomepageSliderItem[] = [
  {
    id: 'slider-1',
    type: 'grader',
    graderId: '1',
    order: 1,
    isActive: true,
  },
  {
    id: 'slider-2',
    type: 'part',
    partId: 'p1',
    order: 2,
    isActive: true,
  },
  {
    id: 'slider-3',
    type: 'grader',
    graderId: '2',
    order: 3,
    isActive: true,
  },
  {
    id: 'slider-4',
    type: 'part',
    partId: 'p2',
    order: 4,
    isActive: true,
  },
];

export const useAppStore = create<AppState & AppActions>()(
  persist(
    (set) => ({
      graders: [...mockGraders], // Force new array
      parts: [...mockParts],     // Force new array
      user: null,
      filters: defaultFilters,
      isLoading: false,
      homepageSlider: [...mockHomepageSlider],
      favorites: [],
      // Cache for filtered results
      _filteredGradersCache: new Map(),

      setGraders: (graders) => set({ graders }),
      
      addGrader: (grader) => set((state) => ({ 
        graders: [...state.graders, grader] 
      })),
      
      updateGrader: (updatedGrader) => set((state) => ({
        graders: state.graders.map(grader => 
          grader.id === updatedGrader.id ? updatedGrader : grader
        )
      })),
      
      deleteGrader: (id) => set((state) => ({
        graders: state.graders.filter(grader => grader.id !== id)
      })),

      setParts: (parts) => set({ parts }),
      
      addPart: (part) => set((state) => ({ 
        parts: [...state.parts, part] 
      })),
      
      updatePart: (updatedPart) => set((state) => ({
        parts: state.parts.map(part => 
          part.id === updatedPart.id ? updatedPart : part
        )
      })),
      
      deletePart: (id) => set((state) => ({
        parts: state.parts.filter(part => part.id !== id)
      })),
      
      setUser: (user) => set({ user }),
      
      setFilters: (newFilters) => set((state) => ({
        filters: { ...state.filters, ...newFilters }
      })),
      
      clearFilters: () => set({ filters: defaultFilters }),
      
      setLoading: (loading) => set({ isLoading: loading }),

      // Homepage Slider Actions
      setHomepageSlider: (items) => set({ homepageSlider: items }),
      
      addHomepageSliderItem: (item) => set((state) => ({
        homepageSlider: [...state.homepageSlider, item]
      })),
      
      updateHomepageSliderItem: (updatedItem) => set((state) => ({
        homepageSlider: state.homepageSlider.map(item =>
          item.id === updatedItem.id ? updatedItem : item
        )
      })),
      
      deleteHomepageSliderItem: (id) => set((state) => ({
        homepageSlider: state.homepageSlider.filter(item => item.id !== id)
      })),
      
      saveHomepageSlider: () => set((state) => {
        // Force save by updating the state
        const updatedSlider = [...state.homepageSlider];
        return {
          homepageSlider: updatedSlider
        };
      }),

      toggleFavorite: (id) => set((state) => ({
        favorites: state.favorites.includes(id)
          ? state.favorites.filter(favId => favId !== id)
          : [...state.favorites, id]
      })),
    }),
    {
      name: 'grader-marketplace-storage-v16',
      partialize: (state) => ({
        graders: state.graders,
        parts: state.parts,
        user: state.user,
        homepageSlider: state.homepageSlider,
      }),
      onRehydrateStorage: () => (state) => {
        // Clear old localStorage data
        if (typeof window !== 'undefined') {
          const oldKeys = ['grader-marketplace-storage-v12', 'grader-marketplace-storage-v13', 'grader-marketplace-storage-v14', 'grader-marketplace-storage-v15'];
          oldKeys.forEach(key => {
            if (localStorage.getItem(key)) {
              localStorage.removeItem(key);
              console.log('Cleared old localStorage:', key);
            }
          });
          
          // Force clear all localStorage if needed
          if (localStorage.getItem('grader-marketplace-storage-v16')) {
            const currentData = JSON.parse(localStorage.getItem('grader-marketplace-storage-v16') || '{}');
            if (currentData.state && currentData.state.homepageSlider && currentData.state.homepageSlider.length !== 4) {
              console.log('Forcing localStorage clear due to incorrect slider count');
              localStorage.removeItem('grader-marketplace-storage-v16');
            }
          }
        }
        
        // Always ensure mock data is loaded
        if (state) {
          // Force load mock data if arrays are empty
          if (state.graders.length === 0) {
            state.graders = [...mockGraders];
          }
          if (state.parts.length === 0) {
            state.parts = [...mockParts];
          } else {
            // Ensure all parts have required fields
            state.parts = state.parts.map(part => ({
              ...part,
              stockQuantity: part.stockQuantity ?? 0,
              stockCountry: part.stockCountry ?? 'EU',
              compatibleModels: part.compatibleModels ?? [],
              images: part.images ?? [],
              specifications: part.specifications ?? {
                material: '',
                dimensions: '',
                weight: '',
                warranty: ''
              }
            }));
          }
          if (state.homepageSlider.length === 0) {
            state.homepageSlider = [...mockHomepageSlider];
          }
          
          // Debug log
          console.log('Store rehydrated:', {
            graders: state.graders.length,
            parts: state.parts.length,
            homepageSlider: state.homepageSlider.length
          });
        }
      },
      skipHydration: false,
    }
  )
);
