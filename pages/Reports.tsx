import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { getTransactions, formatRupiah } from '../services/storage';

const Reports: React.FC = () => {
  const data = useMemo(() => {
    const txs = getTransactions();
    const last7Days = [...Array(7)].map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return d.toISOString().split('T')[0];
    }).reverse();

    return last7Days.map(date => {
      const dayTxs = txs.filter(t => t.date.startsWith(date) && t.type === 'IN');
      const total = dayTxs.reduce((sum, t) => sum + t.total, 0);
      return {
        name: new Date(date).toLocaleDateString('id-ID', { weekday: 'short' }),
        total: total
      };
    });
  }, []);

  const totalRevenue = data.reduce((acc, curr) => acc + curr.total, 0);

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="bg-brand-blue p-6 rounded-b-[30px] shadow-lg mb-6">
        <h1 className="text-white text-xl font-bold mb-2">Laporan Penjualan</h1>
        <p className="text-blue-100 text-sm">7 Hari Terakhir</p>
        <div className="mt-4">
          <p className="text-blue-200 text-xs uppercase tracking-wide">Total Pendapatan</p>
          <p className="text-3xl font-bold text-white">{formatRupiah(totalRevenue)}</p>
        </div>
      </div>

      <div className="px-4">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 h-80">
          <h3 className="font-bold text-gray-800 mb-4">Grafik Penjualan</h3>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{fill: '#9CA3AF', fontSize: 12}}
                dy={10}
              />
              <Tooltip 
                cursor={{fill: '#F3F4F6'}}
                contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'}}
                formatter={(value: number) => [formatRupiah(value), 'Omzet']}
              />
              <Bar dataKey="total" fill="#0EA5E9" radius={[4, 4, 0, 0]} barSize={20} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-6 bg-brand-orange/10 p-4 rounded-xl border border-brand-orange/20">
          <h4 className="text-brand-orange font-bold text-sm mb-2">Tips KasHemat</h4>
          <p className="text-xs text-gray-700 leading-relaxed">
            Pantau terus grafik penjualanmu. Jika grafik menurun, coba buat promosi "Paket Hemat" atau diskon produk yang stoknya masih banyak!
          </p>
        </div>
      </div>
    </div>
  );
};

export default Reports;