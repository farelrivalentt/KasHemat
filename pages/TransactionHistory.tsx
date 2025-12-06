import React, { useState, useEffect } from 'react';
import { Transaction } from '../types';
import { getTransactions, formatRupiah } from '../services/storage';
import { ArrowUpRight, ArrowDownLeft, Filter } from 'lucide-react';

const TransactionHistory: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filter, setFilter] = useState<'ALL' | 'IN' | 'OUT'>('ALL');

  useEffect(() => {
    setTransactions(getTransactions());
  }, []);

  const filteredTxs = transactions.filter(t => filter === 'ALL' || t.type === filter);

  const getTitle = (tx: Transaction) => {
    if (tx.type === 'IN') return 'Penjualan';
    if (tx.category) return tx.category;
    return 'Pengeluaran Operasional';
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
       <div className="bg-white p-4 shadow-sm sticky top-0 z-10">
         <h1 className="text-xl font-bold text-gray-800 mb-4">Riwayat Transaksi</h1>
         <div className="flex gap-2">
           {['ALL', 'IN', 'OUT'].map(f => (
             <button
              key={f}
              onClick={() => setFilter(f as any)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                filter === f 
                ? 'bg-brand-blue text-white' 
                : 'bg-gray-100 text-gray-600'
              }`}
             >
               {f === 'ALL' ? 'Semua' : f === 'IN' ? 'Pemasukan' : 'Pengeluaran'}
             </button>
           ))}
         </div>
       </div>

       <div className="p-4 space-y-3">
         {filteredTxs.map(tx => (
           <div key={tx.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-full ${tx.type === 'IN' ? 'bg-green-100' : 'bg-red-100'}`}>
                     {tx.type === 'IN' ? <ArrowDownLeft className="text-green-600 w-5 h-5"/> : <ArrowUpRight className="text-red-600 w-5 h-5"/>}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800">{getTitle(tx)}</h3>
                    <p className="text-xs text-gray-500">
                      {new Date(tx.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
                <span className={`font-bold ${tx.type === 'IN' ? 'text-green-600' : 'text-red-600'}`}>
                  {tx.type === 'IN' ? '+' : '-'} {formatRupiah(tx.total)}
                </span>
              </div>
              
              {/* Show items if it's a sale */}
              {tx.items && tx.items.length > 0 && (
                <div className="mt-3 pt-3 border-t border-gray-100 text-sm text-gray-600">
                  <p className="text-xs text-gray-400 mb-1">Item:</p>
                  <ul className="space-y-1">
                    {tx.items.map((item, idx) => (
                      <li key={idx} className="flex justify-between">
                        <span>{item.name} x {item.quantity}</span>
                        <span>{formatRupiah(item.price * item.quantity)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Show note if exists (mostly for expenses) */}
              {tx.type === 'OUT' && tx.note && (
                <div className="mt-2 text-xs text-gray-500 italic bg-gray-50 p-2 rounded">
                  {tx.note}
                </div>
              )}
           </div>
         ))}

         {filteredTxs.length === 0 && (
           <div className="text-center mt-10 text-gray-400">Belum ada data transaksi.</div>
         )}
       </div>
    </div>
  );
};

export default TransactionHistory;