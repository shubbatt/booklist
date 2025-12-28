// Type definitions for BookVoucher app

export interface BooklistItem {
  id: string;
  name: string;
  quantity: number;
  rate: number;
  amount: number;
}

export interface Booklist {
  id: string;
  code: string;
  name: string;
  grade: string;
  items: BooklistItem[];
  totalAmount: number;
}

export type DeliveryStatus = 'pending' | 'wrapping' | 'delivered' | 'collected';

export type CustomizationType =
  | 'standard'
  | 'customized_design'
  | 'cellophane_only'
  | 'text_book'
  | 'customized_design_text_book';

export interface VoucherRedemption {
  id: string;
  voucherId: string;
  staffId: string;
  date: string;
  location: string;
  parentName: string;
  contactNo: string;
  studentName: string;
  school: string;
  studentClass: string;
  booklistId: string;
  singleRuled: number;
  doubleRuled: number;
  squareRuled: number;
  additionalItems: string;
  hasTextbooks: boolean;
  hasStationary: boolean;
  lens: boolean;
  noName: boolean;
  cellophane: boolean;
  customization: CustomizationType;
  comments: string;
  deliveryDate: string;
  collectionDate: string;
  deliveryStatus: DeliveryStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Staff {
  id: string;
  name: string;
  username: string;
  outlet_id?: string;
  outlet_name?: string;
}


// Locations are now managed through outlets
export type Location = Outlet;


export interface School {
  id: string;
  name: string;
}

export interface VoucherStock {
  id: string;
  voucherId: string;
  grade: string;
  openingStock: number;
  received: number;
  redeemed: number;
  closingStock: number;
  date: string;
  location: string;
  notes?: string;
}

export interface DayEndReport {
  id: string;
  date: string;
  location: string;
  staffId: string;
  openingStock: VoucherStock[];
  closingStock: VoucherStock[];
  totalRedemptions: number;
  totalValue: number;
  stockCounted: boolean;
  stockCountDate?: string;
  stockCountedBy?: string;
  discrepancies?: StockDiscrepancy[];
  notes?: string;
  createdAt: string;
  completedAt?: string;
}

export interface StockDiscrepancy {
  voucherId: string;
  grade: string;
  expectedStock: number;
  actualStock: number;
  difference: number;
  notes?: string;
}

export interface OptionItem {
  id: string;
  name: string;
  key: string; // Used as the key in form data (e.g., 'hasTextbooks', 'hasStationary')
  enabled: boolean;
  defaultChecked: boolean;
}

export interface VoucherDraft {
  id: string;
  formData: Partial<VoucherRedemption>;
  currentStep: number;
  createdAt: string;
  updatedAt: string;
}

export type UserRole = 'admin' | 'staff';

export interface User {
  id: string;
  username: string;
  password: string; // In production, this should be hashed
  name: string;
  role: UserRole;
  outletId?: string; // For staff, which outlet they're assigned to
  active: boolean;
}

export interface Outlet {
  id: string;
  name: string;
  code: string;
  address?: string;
  active: boolean;
}
