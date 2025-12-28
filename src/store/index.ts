import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import { Booklist, VoucherRedemption, School, Location, Staff, VoucherStock, DayEndReport, StockDiscrepancy, OptionItem, VoucherDraft, User, Outlet } from '../types';


interface AppState {
  // Data
  booklists: Booklist[];
  redemptions: VoucherRedemption[];
  schools: School[];
  locations: Location[];
  staff: Staff[];
  voucherStock: VoucherStock[];
  dayEndReports: DayEndReport[];
  optionItems: OptionItem[];
  drafts: VoucherDraft[];
  users: User[];
  outlets: Outlet[];

  // Auth State
  currentUser: User | null;
  selectedOutlet: Outlet | null;
  isAuthenticated: boolean;

  // UI State
  activeView: 'dashboard' | 'new-redemption' | 'redemptions' | 'booklists' | 'settings' | 'stock' | 'dayend';
  searchQuery: string;
  selectedRedemption: VoucherRedemption | null;
  currentDraftId: string | null;
  _hasHydrated: boolean;
  setHasHydrated: (state: boolean) => void;

  // Actions
  setActiveView: (view: AppState['activeView']) => void;
  setSearchQuery: (query: string) => void;
  setSelectedRedemption: (redemption: VoucherRedemption | null) => void;
  setCurrentDraftId: (draftId: string | null) => void;

  // Draft Management
  createDraft: (formData: Partial<VoucherRedemption>, currentStep: number) => string;
  updateDraft: (draftId: string, formData: Partial<VoucherRedemption>, currentStep: number) => void;
  getDraft: (draftId: string) => VoucherDraft | undefined;
  deleteDraft: (draftId: string) => void;
  getLatestDraft: () => VoucherDraft | undefined;

  // CRUD Operations
  addRedemption: (redemption: Omit<VoucherRedemption, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateRedemption: (id: string, updates: Partial<VoucherRedemption>) => void;
  deleteRedemption: (id: string) => void;

  addBooklist: (booklist: Omit<Booklist, 'id'>) => Promise<void>;
  updateBooklist: (id: string, updates: Partial<Booklist>) => void;
  deleteBooklist: (id: string) => void;

  addSchool: (name: string) => Promise<void>;
  addLocation: (name: string) => Promise<void>;
  addStaff: () => void;

  // Option Items Management
  addOptionItem: (item: Omit<OptionItem, 'id'>) => Promise<void>;
  updateOptionItem: (id: string, updates: Partial<OptionItem>) => void;
  deleteOptionItem: (id: string) => void;
  toggleOptionItem: (id: string) => void;

  // Stock Management
  addVoucherStock: (stock: Omit<VoucherStock, 'id'>) => Promise<void>;
  updateVoucherStock: (id: string, updates: Partial<VoucherStock>) => void;
  getStockByGrade: (grade: string, date: string, location: string) => VoucherStock | undefined;
  getCurrentStock: (grade: string, location: string) => number;
  getPreviousDayClosingStock: (grade: string, date: string, location: string) => number;
  getOpeningStockForDate: (grade: string, date: string, location: string) => number;

  // Day End Reports
  createDayEndReport: (report: Omit<DayEndReport, 'id' | 'createdAt'>) => void;
  updateDayEndReport: (id: string, updates: Partial<DayEndReport>) => void;
  getDayEndReport: (date: string, location: string) => DayEndReport | undefined;
  completeStockCount: (reportId: string, discrepancies: StockDiscrepancy[], countedBy: string) => void;

  // Stats
  getStats: () => {
    totalRedemptions: number;
    pendingDeliveries: number;
    deliveredToday: number;
    totalValue: number;
  };

  // Authentication
  login: (username: string, password: string, outletId?: string) => Promise<boolean>;
  logout: () => void;
  addUser: (user: Omit<User, 'id'>) => void;
  updateUser: (id: string, updates: Partial<User>) => void;
  deleteUser: (id: string) => void;

  // Outlets
  addOutlet: (outlet: Omit<Outlet, 'id'>) => void;
  updateOutlet: (id: string, updates: Partial<Outlet>) => void;
  deleteOutlet: (id: string) => void;
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Initial data - all data comes from database via API
      booklists: [],
      redemptions: [],
      schools: [],
      locations: [],
      staff: [],
      voucherStock: [],
      dayEndReports: [],
      optionItems: [],
      drafts: [],
      users: [],
      outlets: [],

      // Auth State
      currentUser: null,
      selectedOutlet: null,
      isAuthenticated: false,

      // UI State
      activeView: 'dashboard',
      searchQuery: '',
      selectedRedemption: null,
      currentDraftId: null,
      _hasHydrated: false,
      setHasHydrated: (state) => set({ _hasHydrated: state }),

      // Actions
      setActiveView: (view) => set({ activeView: view }),
      setSearchQuery: (query) => set({ searchQuery: query }),
      setSelectedRedemption: (redemption) => set({ selectedRedemption: redemption }),
      setCurrentDraftId: (draftId) => set({ currentDraftId: draftId }),

      // Draft Management
      createDraft: (formData, currentStep) => {
        const draftId = uuidv4();
        const newDraft: VoucherDraft = {
          id: draftId,
          formData,
          currentStep,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        set((state) => ({
          drafts: [newDraft, ...state.drafts],
          currentDraftId: draftId,
        }));
        return draftId;
      },

      updateDraft: (draftId, formData, currentStep) => {
        set((state) => ({
          drafts: state.drafts.map((draft) =>
            draft.id === draftId
              ? { ...draft, formData, currentStep, updatedAt: new Date().toISOString() }
              : draft
          ),
        }));
      },

      getDraft: (draftId) => {
        const state = get();
        return state.drafts.find((d) => d.id === draftId);
      },

      deleteDraft: (draftId) => {
        set((state) => ({
          drafts: state.drafts.filter((d) => d.id !== draftId),
          currentDraftId: state.currentDraftId === draftId ? null : state.currentDraftId,
        }));
      },

      getLatestDraft: () => {
        const state = get();
        return state.drafts.sort((a, b) =>
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        )[0];
      },

      // CRUD Operations
      addRedemption: async (redemption) => {
        try {
          const response = await fetch('/api/redemptions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(redemption),
          });
          if (response.ok) {
            const newRedemption = await response.json();
            set((state) => ({
              redemptions: [newRedemption, ...state.redemptions],
            }));
          }
        } catch (error) {
          console.error('Failed to add redemption:', error);
        }
      },

      updateRedemption: (id, updates) => {
        set((state) => ({
          redemptions: state.redemptions.map((r) =>
            r.id === id ? { ...r, ...updates, updatedAt: new Date().toISOString() } : r
          ),
        }));
      },

      deleteRedemption: (id) => {
        set((state) => ({
          redemptions: state.redemptions.filter((r) => r.id !== id),
        }));
      },

      addBooklist: async (booklist) => {
        try {
          const response = await fetch('/api/booklists', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(booklist),
          });
          if (response.ok) {
            const newBooklist = await response.json();
            set((state) => ({
              booklists: [...state.booklists, newBooklist],
            }));
          }
        } catch (error) {
          console.error('Failed to add booklist:', error);
        }
      },

      updateBooklist: (id, updates) => {
        set((state) => ({
          booklists: state.booklists.map((b) =>
            b.id === id ? { ...b, ...updates } : b
          ),
        }));
      },

      deleteBooklist: (id) => {
        set((state) => ({
          booklists: state.booklists.filter((b) => b.id !== id),
        }));
      },

      addSchool: async (name) => {
        try {
          const response = await fetch('/api/schools', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name }),
          });
          if (response.ok) {
            const newSchool = await response.json();
            set((state) => ({
              schools: [...state.schools, newSchool],
            }));
          }
        } catch (error) {
          console.error('Failed to add school:', error);
        }
      },

      addLocation: async (name) => {
        try {
          const response = await fetch('/api/locations', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name }),
          });
          if (response.ok) {
            const newLocation = await response.json();
            set((state) => ({
              locations: [...state.locations, newLocation],
            }));
          }
        } catch (error) {
          console.error('Failed to add location:', error);
        }
      },

      addStaff: () => {
        // Deprecated: Staff are now managed through users
        console.warn('addStaff is deprecated. Use addUser with role="staff" instead.');
      },

      // Option Items Management
      addOptionItem: async (item) => {
        try {
          const response = await fetch('/api/option-items', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(item),
          });
          if (response.ok) {
            const newItem = await response.json();
            set((state) => ({
              optionItems: [...state.optionItems, newItem],
            }));
          }
        } catch (error) {
          console.error('Failed to add option item:', error);
        }
      },

      updateOptionItem: (id, updates) => {
        set((state) => ({
          optionItems: state.optionItems.map((item) =>
            item.id === id ? { ...item, ...updates } : item
          ),
        }));
      },

      deleteOptionItem: (id) => {
        set((state) => ({
          optionItems: state.optionItems.filter((item) => item.id !== id),
        }));
      },

      toggleOptionItem: (id) => {
        set((state) => ({
          optionItems: state.optionItems.map((item) =>
            item.id === id ? { ...item, enabled: !item.enabled } : item
          ),
        }));
      },

      // Stock Management
      addVoucherStock: async (stock) => {
        try {
          const response = await fetch('/api/stock', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(stock),
          });
          if (response.ok) {
            const newStock = await response.json();
            set((state) => ({
              voucherStock: [...state.voucherStock, newStock],
            }));
          }
        } catch (error) {
          console.error('Failed to add voucher stock:', error);
        }
      },

      updateVoucherStock: (id, updates) => {
        set((state) => ({
          voucherStock: state.voucherStock.map((s) =>
            s.id === id ? { ...s, ...updates } : s
          ),
        }));
      },

      getStockByGrade: (grade, date, location) => {
        const state = get();
        return state.voucherStock.find(
          (s) => s.grade === grade && s.date === date && s.location === location
        );
      },

      getCurrentStock: (grade, location) => {
        const state = get();
        const today = new Date().toISOString().split('T')[0];
        const stock = state.voucherStock
          .filter((s) => s.grade === grade && s.location === location && s.date <= today)
          .sort((a, b) => b.date.localeCompare(a.date))[0];
        return stock?.closingStock || 0;
      },

      getPreviousDayClosingStock: (grade, date, location) => {
        const state = get();
        // Get the most recent stock entry before the given date
        const previousStock = state.voucherStock
          .filter((s) => s.grade === grade && s.location === location && s.date < date)
          .sort((a, b) => b.date.localeCompare(a.date))[0];
        return previousStock?.closingStock || 0;
      },

      getOpeningStockForDate: (grade, date, location) => {
        const state = get();
        // First check if there's already a stock entry for this date
        const existingStock = state.voucherStock.find(
          (s) => s.grade === grade && s.date === date && s.location === location
        );
        if (existingStock) {
          return existingStock.openingStock;
        }
        // Otherwise, get from previous day's closing stock
        return get().getPreviousDayClosingStock(grade, date, location);
      },

      // Day End Reports
      createDayEndReport: (report) => {
        const newReport: DayEndReport = {
          ...report,
          id: uuidv4(),
          createdAt: new Date().toISOString(),
        };
        set((state) => ({
          dayEndReports: [newReport, ...state.dayEndReports],
        }));
      },

      updateDayEndReport: (id, updates) => {
        set((state) => ({
          dayEndReports: state.dayEndReports.map((r) =>
            r.id === id ? { ...r, ...updates } : r
          ),
        }));
      },

      getDayEndReport: (date, location) => {
        const state = get();
        return state.dayEndReports.find(
          (r) => r.date === date && r.location === location
        );
      },

      completeStockCount: (reportId, discrepancies, countedBy) => {
        set((state) => ({
          dayEndReports: state.dayEndReports.map((r) =>
            r.id === reportId
              ? {
                ...r,
                stockCounted: true,
                stockCountDate: new Date().toISOString(),
                stockCountedBy: countedBy,
                discrepancies,
              }
              : r
          ),
        }));
      },

      getStats: () => {
        const state = get();
        const today = new Date().toISOString().split('T')[0];

        return {
          totalRedemptions: state.redemptions.length,
          pendingDeliveries: state.redemptions.filter(
            (r) => r.deliveryStatus === 'pending' || r.deliveryStatus === 'wrapping'
          ).length,
          deliveredToday: state.redemptions.filter(
            (r) => r.deliveryDate === today && r.deliveryStatus === 'delivered'
          ).length,
          totalValue: state.redemptions.reduce((sum, r) => {
            const booklist = state.booklists.find((b) => b.id === r.booklistId);
            return sum + (booklist?.totalAmount || 0);
          }, 0),
        };
      },

      // Authentication
      login: async (username, password, outletId) => {
        try {
          const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password, outletId }),
          });

          if (!response.ok) {
            return false;
          }

          const data = await response.json();
          const { user, outlet } = data;

          set({
            currentUser: user,
            selectedOutlet: outlet,
            isAuthenticated: true,
            activeView: 'dashboard'
          });

          return true;
        } catch (error) {
          console.error('Login error:', error);
          return false;
        }
      },

      logout: () => {
        set({
          currentUser: null,
          selectedOutlet: null,
          isAuthenticated: false,
          activeView: 'dashboard'
        });
      },

      addUser: (user) => {
        const newUser: User = {
          ...user,
          id: uuidv4(),
        };
        set((state) => ({
          users: [...state.users, newUser],
        }));
      },

      updateUser: (id, updates) => {
        set((state) => ({
          users: state.users.map((u) =>
            u.id === id ? { ...u, ...updates } : u
          ),
        }));
      },

      deleteUser: (id) => {
        set((state) => ({
          users: state.users.filter((u) => u.id !== id),
        }));
      },

      // Outlets
      addOutlet: (outlet) => {
        const newOutlet: Outlet = {
          ...outlet,
          id: uuidv4(),
        };
        set((state) => ({
          outlets: [...state.outlets, newOutlet],
        }));
      },

      updateOutlet: (id, updates) => {
        set((state) => ({
          outlets: state.outlets.map((o) =>
            o.id === id ? { ...o, ...updates } : o
          ),
        }));
      },

      deleteOutlet: (id) => {
        set((state) => ({
          outlets: state.outlets.filter((o) => o.id !== id),
        }));
      },
    }),
    {
      name: 'booklist-storage',
      // partialize allows us to pick which fields to save to localStorage
      partialize: (state) => ({
        booklists: state.booklists,
        redemptions: state.redemptions,
        schools: state.schools,
        locations: state.locations,
        staff: state.staff,
        voucherStock: state.voucherStock,
        dayEndReports: state.dayEndReports,
        optionItems: state.optionItems,
        drafts: state.drafts,
        currentDraftId: state.currentDraftId,
        // Auth state to persist session
        currentUser: state.currentUser,
        selectedOutlet: state.selectedOutlet,
        isAuthenticated: state.isAuthenticated,
        activeView: state.activeView,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
