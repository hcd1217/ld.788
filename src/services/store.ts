// Mock store service with fake delays and responses

export interface Store {
  id: string;
  name: string;
  address: string;
  location: {
    lat: number;
    lng: number;
  };
  operatingHours: Record<
    string,
    | {
        open: string; // "09:00"
        close: string; // "17:00"
      }
    | {closed: boolean}
  >;
  createdAt: string;
  updatedAt: string;
}

export type CreateStoreRequest = {
  name: string;
  address: string;
  location: {
    lat: number;
    lng: number;
  };
  operatingHours: Store['operatingHours'];
};

export type UpdateStoreRequest = Partial<CreateStoreRequest>;

// Mock data storage
const mockStores: Store[] = [
  {
    id: 'store-001',
    name: 'Cà Phê Sài Gòn',
    address: '123 Nguyễn Huệ, Quận 1, TP.HCM',
    location: {
      lat: 10.7769,
      lng: 106.7009,
    },
    operatingHours: {
      monday: {open: '07:00', close: '22:00'},
      tuesday: {open: '07:00', close: '22:00'},
      wednesday: {open: '07:00', close: '22:00'},
      thursday: {open: '07:00', close: '22:00'},
      friday: {open: '07:00', close: '23:00'},
      saturday: {open: '08:00', close: '23:00'},
      sunday: {open: '08:00', close: '22:00'},
    },
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z',
  },
  {
    id: 'store-002',
    name: 'Bánh Mì Phượng',
    address: '456 Lê Lợi, Quận 1, TP.HCM',
    location: {
      lat: 10.7734,
      lng: 106.6983,
    },
    operatingHours: {
      monday: {open: '06:00', close: '20:00'},
      tuesday: {open: '06:00', close: '20:00'},
      wednesday: {open: '06:00', close: '20:00'},
      thursday: {open: '06:00', close: '20:00'},
      friday: {open: '06:00', close: '20:00'},
      saturday: {open: '06:00', close: '21:00'},
      sunday: {open: '07:00', close: '19:00'},
    },
    createdAt: '2024-01-10T08:00:00Z',
    updatedAt: '2024-01-10T08:00:00Z',
  },
  {
    id: 'store-003',
    name: 'Phở 24',
    address: '789 Trần Hưng Đạo, Quận 5, TP.HCM',
    location: {
      lat: 10.7556,
      lng: 106.6821,
    },
    operatingHours: {
      monday: {open: '06:00', close: '23:00'},
      tuesday: {open: '06:00', close: '23:00'},
      wednesday: {open: '06:00', close: '23:00'},
      thursday: {open: '06:00', close: '23:00'},
      friday: {open: '06:00', close: '00:00'},
      saturday: {open: '06:00', close: '00:00'},
      sunday: {open: '06:00', close: '23:00'},
    },
    createdAt: '2024-01-20T06:30:00Z',
    updatedAt: '2024-01-20T06:30:00Z',
  },
  {
    id: 'store-004',
    name: 'Cơm Tấm Sườn Bì',
    address: '321 Võ Văn Tần, Quận 3, TP.HCM',
    location: {
      lat: 10.7756,
      lng: 106.6921,
    },
    operatingHours: {
      monday: {open: '07:00', close: '21:00'},
      tuesday: {open: '07:00', close: '21:00'},
      wednesday: {open: '07:00', close: '21:00'},
      thursday: {open: '07:00', close: '21:00'},
      friday: {open: '07:00', close: '21:00'},
      saturday: {open: '07:00', close: '21:00'},
      sunday: {closed: true},
    },
    createdAt: '2024-01-12T09:15:00Z',
    updatedAt: '2024-01-12T09:15:00Z',
  },
  {
    id: 'store-005',
    name: 'Bún Bò Huế Đông Ba',
    address: '567 Cách Mạng Tháng 8, Quận 10, TP.HCM',
    location: {
      lat: 10.7821,
      lng: 106.6656,
    },
    operatingHours: {
      monday: {open: '06:30', close: '22:00'},
      tuesday: {open: '06:30', close: '22:00'},
      wednesday: {open: '06:30', close: '22:00'},
      thursday: {open: '06:30', close: '22:00'},
      friday: {open: '06:30', close: '22:00'},
      saturday: {open: '06:30', close: '22:00'},
      sunday: {open: '07:00', close: '21:00'},
    },
    createdAt: '2024-01-08T11:45:00Z',
    updatedAt: '2024-01-08T11:45:00Z',
  },
];

// Simulate API delay
const delay = async (ms: number) =>
  new Promise<void>((resolve) => {
    setTimeout(resolve, ms);
  });

// Generate unique ID
const generateId = () =>
  `store-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;

export const storeService = {
  async getAllStores(): Promise<Store[]> {
    await delay(500); // Simulate network delay
    return [...mockStores];
  },

  async getStoreById(id: string): Promise<Store | undefined> {
    await delay(300);
    return mockStores.find((store) => store.id === id);
  },

  async createStore(data: CreateStoreRequest): Promise<Store> {
    await delay(800);

    // Simulate validation error (optional)
    if (Math.random() < 0.1) {
      // 10% chance of error
      throw new Error('Failed to create store. Please try again.');
    }

    const newStore: Store = {
      id: generateId(),
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    mockStores.push(newStore);
    return newStore;
  },

  async updateStore(id: string): Promise<Store> {
    await delay(600);

    const storeIndex = mockStores.findIndex((store) => store.id === id);
    if (storeIndex === -1) {
      throw new Error('Store not found');
    }

    // Note: According to requirements, stores cannot be edited after creation
    // This method is here for future use but should be restricted in UI
    throw new Error('Store editing is not allowed after creation');
  },

  async deleteStore(id: string): Promise<void> {
    await delay(400);

    const storeIndex = mockStores.findIndex((store) => store.id === id);
    if (storeIndex === -1) {
      throw new Error('Store not found');
    }

    mockStores.splice(storeIndex, 1);
  },

  // Utility method to validate store data
  validateStoreData(data: CreateStoreRequest): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (!data.name || data.name.trim().length < 2) {
      errors.push('Store name must be at least 2 characters long');
    }

    if (!data.address || data.address.trim().length < 5) {
      errors.push('Store address must be at least 5 characters long');
    }

    if (!data.location?.lat || !data.location.lng) {
      errors.push('Store location coordinates are required');
    }

    if (!data.operatingHours || Object.keys(data.operatingHours).length === 0) {
      errors.push('Operating hours are required');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  },

  // Check if store name is unique
  async isStoreNameUnique(name: string, excludeId?: string): Promise<boolean> {
    await delay(200);
    const normalizedName = name.toLowerCase().trim();
    return !mockStores.some(
      (store) =>
        store.id !== excludeId &&
        store.name.toLowerCase().trim() === normalizedName,
    );
  },
};
