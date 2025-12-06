export interface Product {
  id: string;
  name: string;
  price: number;
  cost: number; // Harga modal
  stock: number;
  category: string;
  image?: string;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface Transaction {
  id: string;
  date: string; // ISO string
  type: 'IN' | 'OUT'; // Pemasukan (Penjualan) or Pengeluaran (Operasional)
  total: number;
  items?: CartItem[]; // Only for 'IN' (Sales)
  note?: string; // For expenses or sales notes
  category?: string; // Optional category for expenses
}

export interface DailySummary {
  date: string;
  revenue: number;
  expense: number;
  profit: number;
}

export type TabView = 'dashboard' | 'pos' | 'products' | 'transactions' | 'reports';