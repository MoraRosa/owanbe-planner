// Owambe Planner - IndexedDB Storage Layer

import type { 
  User, 
  PlannerEvent, 
  Vendor, 
  BudgetCategory, 
  Transaction, 
  Guest, 
  Message 
} from '@/types/planner';

const DB_NAME = 'owambe_planner';
const DB_VERSION = 1;

let db: IDBDatabase | null = null;

// Initialize the database
export const initDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    if (db) {
      resolve(db);
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);

    request.onsuccess = () => {
      db = request.result;
      resolve(db);
    };

    request.onupgradeneeded = (event) => {
      const database = (event.target as IDBOpenDBRequest).result;

      // Users store
      if (!database.objectStoreNames.contains('users')) {
        const usersStore = database.createObjectStore('users', { keyPath: 'id' });
        usersStore.createIndex('email', 'email', { unique: true });
        usersStore.createIndex('role', 'role', { unique: false });
      }

      // Events store
      if (!database.objectStoreNames.contains('events')) {
        const eventsStore = database.createObjectStore('events', { keyPath: 'id' });
        eventsStore.createIndex('userId', 'userId', { unique: false });
        eventsStore.createIndex('status', 'status', { unique: false });
        eventsStore.createIndex('date', 'date', { unique: false });
      }

      // Vendors store
      if (!database.objectStoreNames.contains('vendors')) {
        const vendorsStore = database.createObjectStore('vendors', { keyPath: 'id' });
        vendorsStore.createIndex('userId', 'userId', { unique: true });
        vendorsStore.createIndex('location', 'location', { unique: false });
      }

      // Budget Categories store
      if (!database.objectStoreNames.contains('budgetCategories')) {
        const budgetStore = database.createObjectStore('budgetCategories', { keyPath: 'id' });
        budgetStore.createIndex('eventId', 'eventId', { unique: false });
      }

      // Transactions store
      if (!database.objectStoreNames.contains('transactions')) {
        const transactionsStore = database.createObjectStore('transactions', { keyPath: 'id' });
        transactionsStore.createIndex('eventId', 'eventId', { unique: false });
        transactionsStore.createIndex('budgetCategoryId', 'budgetCategoryId', { unique: false });
        transactionsStore.createIndex('vendorId', 'vendorId', { unique: false });
      }

      // Guests store
      if (!database.objectStoreNames.contains('guests')) {
        const guestsStore = database.createObjectStore('guests', { keyPath: 'id' });
        guestsStore.createIndex('eventId', 'eventId', { unique: false });
        guestsStore.createIndex('rsvpStatus', 'rsvpStatus', { unique: false });
      }

      // Messages store
      if (!database.objectStoreNames.contains('messages')) {
        const messagesStore = database.createObjectStore('messages', { keyPath: 'id' });
        messagesStore.createIndex('senderId', 'senderId', { unique: false });
        messagesStore.createIndex('receiverId', 'receiverId', { unique: false });
        messagesStore.createIndex('eventId', 'eventId', { unique: false });
      }
    };
  });
};

// Generate unique ID
export const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

// Generic CRUD operations
const getStore = async (storeName: string, mode: IDBTransactionMode = 'readonly'): Promise<IDBObjectStore> => {
  const database = await initDB();
  const transaction = database.transaction(storeName, mode);
  return transaction.objectStore(storeName);
};

// Get all items from a store
export const getAll = async <T>(storeName: string): Promise<T[]> => {
  const store = await getStore(storeName);
  return new Promise((resolve, reject) => {
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

// Get item by ID
export const getById = async <T>(storeName: string, id: string): Promise<T | undefined> => {
  const store = await getStore(storeName);
  return new Promise((resolve, reject) => {
    const request = store.get(id);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

// Get items by index
export const getByIndex = async <T>(storeName: string, indexName: string, value: string): Promise<T[]> => {
  const store = await getStore(storeName);
  return new Promise((resolve, reject) => {
    const index = store.index(indexName);
    const request = index.getAll(value);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

// Add item
export const add = async <T>(storeName: string, item: T): Promise<T> => {
  const store = await getStore(storeName, 'readwrite');
  return new Promise((resolve, reject) => {
    const request = store.add(item);
    request.onsuccess = () => resolve(item);
    request.onerror = () => reject(request.error);
  });
};

// Update item
export const update = async <T>(storeName: string, item: T): Promise<T> => {
  const store = await getStore(storeName, 'readwrite');
  return new Promise((resolve, reject) => {
    const request = store.put(item);
    request.onsuccess = () => resolve(item);
    request.onerror = () => reject(request.error);
  });
};

// Delete item
export const remove = async (storeName: string, id: string): Promise<boolean> => {
  const store = await getStore(storeName, 'readwrite');
  return new Promise((resolve, reject) => {
    const request = store.delete(id);
    request.onsuccess = () => resolve(true);
    request.onerror = () => reject(request.error);
  });
};

// ============= User Operations =============
export const createUser = async (userData: Omit<User, 'id' | 'createdAt'>): Promise<User> => {
  const user: User = {
    ...userData,
    id: generateId(),
    createdAt: new Date().toISOString(),
  };
  return add('users', user);
};

export const getUserByEmail = async (email: string): Promise<User | undefined> => {
  const users = await getByIndex<User>('users', 'email', email);
  return users[0];
};

export const getUser = async (id: string): Promise<User | undefined> => {
  return getById('users', id);
};

// ============= Event Operations =============
export const createEvent = async (eventData: Omit<PlannerEvent, 'id' | 'createdAt' | 'updatedAt'>): Promise<PlannerEvent> => {
  const event: PlannerEvent = {
    ...eventData,
    id: generateId(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  return add('events', event);
};

export const getUserEvents = async (userId: string): Promise<PlannerEvent[]> => {
  return getByIndex<PlannerEvent>('events', 'userId', userId);
};

export const getEvent = async (id: string): Promise<PlannerEvent | undefined> => {
  return getById('events', id);
};

export const updateEvent = async (event: PlannerEvent): Promise<PlannerEvent> => {
  const updated = { ...event, updatedAt: new Date().toISOString() };
  return update('events', updated);
};

export const deleteEvent = async (id: string): Promise<boolean> => {
  return remove('events', id);
};

// ============= Vendor Operations =============
export const createVendor = async (vendorData: Omit<Vendor, 'id' | 'createdAt' | 'updatedAt'>): Promise<Vendor> => {
  const vendor: Vendor = {
    ...vendorData,
    id: generateId(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  return add('vendors', vendor);
};

export const getAllVendors = async (): Promise<Vendor[]> => {
  return getAll<Vendor>('vendors');
};

export const getVendor = async (id: string): Promise<Vendor | undefined> => {
  return getById('vendors', id);
};

export const updateVendor = async (vendor: Vendor): Promise<Vendor> => {
  const updated = { ...vendor, updatedAt: new Date().toISOString() };
  return update('vendors', updated);
};

// ============= Budget Category Operations =============
export const createBudgetCategory = async (data: Omit<BudgetCategory, 'id' | 'createdAt'>): Promise<BudgetCategory> => {
  const category: BudgetCategory = {
    ...data,
    id: generateId(),
    createdAt: new Date().toISOString(),
  };
  return add('budgetCategories', category);
};

export const getEventBudgetCategories = async (eventId: string): Promise<BudgetCategory[]> => {
  return getByIndex<BudgetCategory>('budgetCategories', 'eventId', eventId);
};

export const updateBudgetCategory = async (category: BudgetCategory): Promise<BudgetCategory> => {
  return update('budgetCategories', category);
};

export const deleteBudgetCategory = async (id: string): Promise<boolean> => {
  return remove('budgetCategories', id);
};

// ============= Transaction Operations =============
export const createTransaction = async (data: Omit<Transaction, 'id' | 'createdAt'>): Promise<Transaction> => {
  const transaction: Transaction = {
    ...data,
    id: generateId(),
    createdAt: new Date().toISOString(),
  };
  return add('transactions', transaction);
};

export const getEventTransactions = async (eventId: string): Promise<Transaction[]> => {
  return getByIndex<Transaction>('transactions', 'eventId', eventId);
};

export const deleteTransaction = async (id: string): Promise<boolean> => {
  return remove('transactions', id);
};

// ============= Guest Operations =============
export const createGuest = async (data: Omit<Guest, 'id' | 'createdAt'>): Promise<Guest> => {
  const guest: Guest = {
    ...data,
    id: generateId(),
    createdAt: new Date().toISOString(),
  };
  return add('guests', guest);
};

export const getEventGuests = async (eventId: string): Promise<Guest[]> => {
  return getByIndex<Guest>('guests', 'eventId', eventId);
};

export const updateGuest = async (guest: Guest): Promise<Guest> => {
  return update('guests', guest);
};

export const deleteGuest = async (id: string): Promise<boolean> => {
  return remove('guests', id);
};

// ============= Message Operations =============
export const createMessage = async (data: Omit<Message, 'id' | 'createdAt'>): Promise<Message> => {
  const message: Message = {
    ...data,
    id: generateId(),
    createdAt: new Date().toISOString(),
  };
  return add('messages', message);
};

export const getUserMessages = async (userId: string): Promise<Message[]> => {
  const sent = await getByIndex<Message>('messages', 'senderId', userId);
  const received = await getByIndex<Message>('messages', 'receiverId', userId);
  return [...sent, ...received].sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
};

export const markMessageAsRead = async (id: string): Promise<void> => {
  const message = await getById<Message>('messages', id);
  if (message) {
    await update('messages', { ...message, read: true });
  }
};

// ============= Seed Demo Data =============
export const seedDemoData = async (): Promise<void> => {
  const existingVendors = await getAllVendors();
  if (existingVendors.length > 0) return;

  // Seed sample vendors
  const sampleVendors: Omit<Vendor, 'id' | 'createdAt' | 'updatedAt'>[] = [
    {
      userId: 'vendor-1',
      businessName: 'Mama Ngozi Catering',
      description: 'Authentic Nigerian cuisine for all celebrations. Jollof rice, pounded yam, and more!',
      categories: ['catering'],
      priceRangeMin: 800,
      priceRangeMax: 5000,
      currency: 'CAD',
      location: 'Hamilton, ON',
      portfolioImages: ['https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400'],
      rating: 4.8,
      reviewCount: 124,
      verified: true,
    },
    {
      userId: 'vendor-2',
      businessName: 'Chisom Photography',
      description: 'Capturing your special moments with style and elegance.',
      categories: ['photography', 'videography'],
      priceRangeMin: 1200,
      priceRangeMax: 4500,
      currency: 'CAD',
      location: 'Toronto, ON',
      portfolioImages: ['https://images.unsplash.com/photo-1537633552985-df8429e8048b?w=400'],
      rating: 4.9,
      reviewCount: 89,
      verified: true,
    },
    {
      userId: 'vendor-3',
      businessName: 'DJ Abiodun',
      description: 'The party never stops when DJ Abiodun is on the decks!',
      categories: ['dj', 'entertainment'],
      priceRangeMin: 400,
      priceRangeMax: 1500,
      currency: 'CAD',
      location: 'Mississauga, ON',
      portfolioImages: ['https://images.unsplash.com/photo-1571266028243-3716f02e2818?w=400'],
      rating: 4.7,
      reviewCount: 67,
      verified: true,
    },
    {
      userId: 'vendor-4',
      businessName: 'Adunni Decor',
      description: 'Transform your venue into a paradise. Traditional and modern designs.',
      categories: ['decoration'],
      priceRangeMin: 1500,
      priceRangeMax: 8000,
      currency: 'CAD',
      location: 'Brampton, ON',
      portfolioImages: ['https://images.unsplash.com/photo-1478146059778-26028b07395a?w=400'],
      rating: 4.9,
      reviewCount: 156,
      verified: true,
    },
    {
      userId: 'vendor-5',
      businessName: 'MC Bright',
      description: 'Keep your guests entertained with the best MC in town!',
      categories: ['mc'],
      priceRangeMin: 500,
      priceRangeMax: 2000,
      currency: 'CAD',
      location: 'Hamilton, ON',
      portfolioImages: ['https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=400'],
      rating: 4.6,
      reviewCount: 45,
      verified: false,
    },
    {
      userId: 'vendor-6',
      businessName: 'Heavenly Cakes by Tola',
      description: 'Custom wedding cakes, birthday cakes, and celebration cakes with Nigerian-inspired designs.',
      categories: ['cake'],
      priceRangeMin: 300,
      priceRangeMax: 2500,
      currency: 'CAD',
      location: 'Oakville, ON',
      portfolioImages: ['https://images.unsplash.com/photo-1535141192574-5d4897c12f75?w=400'],
      rating: 4.9,
      reviewCount: 78,
      verified: true,
    },
    {
      userId: 'vendor-7',
      businessName: 'Aso Oke Elegance',
      description: 'Premium traditional attire and fashion styling for your special day.',
      categories: ['fashion'],
      priceRangeMin: 500,
      priceRangeMax: 5000,
      currency: 'CAD',
      location: 'Toronto, ON',
      portfolioImages: ['https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=400'],
      rating: 4.8,
      reviewCount: 92,
      verified: true,
    },
    {
      userId: 'vendor-8',
      businessName: 'GTA Event Venues',
      description: 'Beautiful banquet halls and event spaces for weddings and celebrations.',
      categories: ['venue'],
      priceRangeMin: 2000,
      priceRangeMax: 15000,
      currency: 'CAD',
      location: 'Burlington, ON',
      portfolioImages: ['https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=400'],
      rating: 4.7,
      reviewCount: 134,
      verified: true,
    },
  ];

  for (const vendor of sampleVendors) {
    await createVendor(vendor);
  }
};
