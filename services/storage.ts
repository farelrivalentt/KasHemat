import { Product, Transaction } from '../types';

const STORAGE_KEYS = {
  PRODUCTS: 'kashemat_products',
  TRANSACTIONS: 'kashemat_transactions',
};

// Initial Mock Data
const INITIAL_PRODUCTS: Product[] = [
  { id: '1', name: 'Indomie Goreng', price: 3500, cost: 3000, stock: 45, category: 'Makanan' },
  { id: '2', name: 'Kopi Kapal Api', price: 2000, cost: 1500, stock: 100, category: 'Minuman' },
  { id: '3', name: 'Aqua Botol 600ml', price: 4000, cost: 3000, stock: 24, category: 'Minuman' },
  { id: '4', name: 'Telur Ayam (1kg)', price: 28000, cost: 26000, stock: 10, category: 'Sembako' },
  { id: '5', name: 'Beras 5kg', price: 65000, cost: 60000, stock: 5, category: 'Sembako' },
  { id: '6', name: 'Teh Pucuk Harum', price: 4000, cost: 3200, stock: 30, category: 'Minuman' },
];

export const getProducts = (): Product[] => {
  const stored = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
  if (!stored) {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(INITIAL_PRODUCTS));
    return INITIAL_PRODUCTS;
  }
  return JSON.parse(stored);
};

export const saveProduct = (product: Product): void => {
  const products = getProducts();
  const index = products.findIndex((p) => p.id === product.id);
  if (index >= 0) {
    products[index] = product;
  } else {
    products.push(product);
  }
  localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
};

export const deleteProduct = (id: string): void => {
  const products = getProducts().filter((p) => p.id !== id);
  localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
};

export const getTransactions = (): Transaction[] => {
  const stored = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
  return stored ? JSON.parse(stored) : [];
};

export const saveTransaction = (transaction: Transaction): void => {
  const transactions = getTransactions();
  transactions.unshift(transaction); // Add to top
  localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));

  // If it's a sale, update stock
  if (transaction.type === 'IN' && transaction.items) {
    const products = getProducts();
    transaction.items.forEach((item) => {
      const productIndex = products.findIndex((p) => p.id === item.id);
      if (productIndex >= 0) {
        products[productIndex].stock = Math.max(0, products[productIndex].stock - item.quantity);
      }
    });
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
  }
};

export const addExpenseFromStockPurchase = (productName: string, quantity: number, unitCost: number): void => {
  if (quantity <= 0 || unitCost <= 0) return;
  
  const nominal = quantity * unitCost;
  const transaction: Transaction = {
    id: Date.now().toString() + Math.random().toString(36).substr(2, 5), // Ensure unique ID
    date: new Date().toISOString(),
    type: 'OUT',
    total: nominal,
    category: "Stok Barang / Bahan Baku",
    note: `Pembelian stok: ${productName}`
  };
  
  saveTransaction(transaction);
};

export const formatRupiah = (amount: number): string => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};