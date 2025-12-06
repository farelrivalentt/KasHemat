import React, { useEffect, useState } from 'react';
import { TrendingUp, TrendingDown, Wallet, ArrowRight, Calculator, Package } from 'lucide-react';
import { Transaction, Product } from '../types';
import { getTransactions, formatRupiah, getProducts } from '../services/storage';

interface DashboardProps {
  onChangeTab: (tab: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onChangeTab }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [summary, setSummary] = useState({ income: 0, expense: 0, balance: 0 });

  useEffect(() => {
    const txs = getTransactions();
    const prods = getProducts();
    setTransactions(txs);
    setProducts(prods);

    const today = new Date().toISOString().split('T')[0];
    
    // Calculate simple stats for "All Time" (for demo purposes) or "Today"
    let income = 0;
    let expense = 0;

    txs.forEach(t => {
       // Filter for today if needed, currently doing all time for demo visualization
       if (t.type === 'IN') income += t.total;
       else expense += t.total;
    });

    setSummary({ income, expense, balance: income - expense });
  }, []);

  const lowStockProducts = products.filter(p => p.stock < 5);

  return (
    <div className="pb-24 bg-gray-50 min-h-screen">
      {/* Curved Header */}
      <div className="bg-brand-blue rounded-b-[40px] pt-8 pb-16 px-6 shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-5 rounded-full -mr-10 -mt-10"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-brand-orange opacity-10 rounded-full -ml-10 -mb-5"></div>
        
        <div className="relative z-10">
          <h1 className="text-white text-lg font-medium opacity-90">Halo, Juragan!</h1>
          <h2 className="text-white text-3xl font-bold mt-1">Warung Berkah</h2>
        </div>
      </div>

      {/* Main Summary Card - Overlapping Header */}
      <div className="px-5 -mt-10 relative z-20">
        <div className="bg-white rounded-2xl shadow-md p-5 border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-500 text-sm font-medium">Saldo Kas</span>
            <div className="bg-blue-50 p-2 rounded-full">
               <Wallet className="text-brand-blue w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-800">{formatRupiah(summary.balance)}</p>
          
          <div className="mt-6 flex gap-4">
            <div className="flex-1 bg-green-50 p-3 rounded-xl border border-green-100">
              <div className="flex items-center gap-1.5 mb-1">
                <div className="bg-green-500 rounded-full p-1">
                  <TrendingUp className="w-3 h-3 text-white" />
                </div>
                <span className="text-xs text-green-700 font-semibold">Pemasukan</span>
              </div>
              <p className="text-lg font-bold text-gray-800">{formatRupiah(summary.income)}</p>
            </div>
            
            <div className="flex-1 bg-red-50 p-3 rounded-xl border border-red-100">
               <div className="flex items-center gap-1.5 mb-1">
                <div className="bg-red-500 rounded-full p-1">
                  <TrendingDown className="w-3 h-3 text-white" />
                </div>
                <span className="text-xs text-red-700 font-semibold">Pengeluaran</span>
              </div>
              <p className="text-lg font-bold text-gray-800">{formatRupiah(summary.expense)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="px-5 mt-6">
        <h3 className="text-gray-800 font-bold mb-3 text-lg">Aksi Cepat</h3>
        <div className="grid grid-cols-2 gap-4">
          <button 
            onClick={() => onChangeTab('pos')}
            className="bg-brand-blue text-white p-4 rounded-xl shadow-sm active:scale-95 transition-transform flex flex-col items-center justify-center gap-2"
          >
            <div className="bg-white/20 p-2 rounded-full">
              <Calculator className="w-6 h-6" />
            </div>
            <span className="font-semibold">Kasir Baru</span>
          </button>
          
          <button 
            onClick={() => onChangeTab('products')}
            className="bg-white text-brand-blue border border-brand-blue p-4 rounded-xl shadow-sm active:scale-95 transition-transform flex flex-col items-center justify-center gap-2"
          >
            <div className="bg-brand-blue/10 p-2 rounded-full">
              <Package className="w-6 h-6" />
            </div>
            <span className="font-semibold">Tambah Stok</span>
          </button>
        </div>
      </div>

      {/* Alerts / Low Stock */}
      {lowStockProducts.length > 0 && (
        <div className="px-5 mt-6">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-gray-800 font-bold text-lg">Stok Menipis</h3>
            <button onClick={() => onChangeTab('products')} className="text-brand-orange text-sm font-semibold">Lihat Semua</button>
          </div>
          <div className="space-y-3">
            {lowStockProducts.slice(0, 3).map(product => (
              <div key={product.id} className="bg-white p-3 rounded-xl border-l-4 border-brand-orange shadow-sm flex justify-between items-center">
                <div>
                  <p className="font-medium text-gray-800">{product.name}</p>
                  <p className="text-xs text-gray-500">Sisa stok: <span className="text-red-500 font-bold">{product.stock}</span></p>
                </div>
                <button 
                  onClick={() => onChangeTab('products')}
                  className="bg-brand-orange/10 text-brand-orange px-3 py-1 rounded-full text-xs font-semibold"
                >
                  Restock
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Transactions */}
      <div className="px-5 mt-6">
         <div className="flex justify-between items-center mb-3">
            <h3 className="text-gray-800 font-bold text-lg">Transaksi Terakhir</h3>
            <button onClick={() => onChangeTab('transactions')} className="text-brand-blue text-sm font-semibold flex items-center">
              Lihat Semua <ArrowRight className="w-4 h-4 ml-1"/>
            </button>
          </div>
          
          <div className="bg-white rounded-2xl shadow-sm divide-y divide-gray-100">
            {transactions.slice(0, 5).map(tx => (
              <div key={tx.id} className="p-4 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-full ${tx.type === 'IN' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                    {tx.type === 'IN' ? <TrendingUp size={18} /> : <TrendingDown size={18} />}
                  </div>
                  <div>
                    <p className="font-medium text-gray-800 text-sm">
                      {tx.type === 'IN' ? 'Penjualan' : 'Pengeluaran'}
                    </p>
                    <p className="text-xs text-gray-500">{new Date(tx.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
                </div>
                <span className={`font-bold text-sm ${tx.type === 'IN' ? 'text-green-600' : 'text-red-600'}`}>
                  {tx.type === 'IN' ? '+' : '-'} {formatRupiah(tx.total)}
                </span>
              </div>
            ))}
            {transactions.length === 0 && (
              <div className="p-8 text-center text-gray-400 text-sm">Belum ada transaksi</div>
            )}
          </div>
      </div>
    </div>
  );
};

export default Dashboard;