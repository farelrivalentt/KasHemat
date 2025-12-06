import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Search, X } from 'lucide-react';
import { Product, Transaction } from '../types';
import { getProducts, saveProduct, deleteProduct, formatRupiah, addExpenseFromStockPurchase, getTransactions } from '../services/storage';

const Products: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  const initialFormState = { id: '', name: '', price: 0, cost: 0, stock: 0, category: 'Umum' };
  const [formData, setFormData] = useState(initialFormState);
  
  // State for transaction history of the specific product being edited
  const [productHistory, setProductHistory] = useState<{date: string, qty: number, total: number}[]>([]);

  useEffect(() => {
    setProducts(getProducts());
  }, []);

  const refresh = () => setProducts(getProducts());

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Logic to detect stock increase and create expense
    const currentProducts = getProducts();
    const oldProduct = currentProducts.find(p => p.id === formData.id);
    
    let addedStock = 0;
    
    if (!oldProduct) {
      // New Product
      addedStock = formData.stock;
    } else {
      // Existing Product
      addedStock = formData.stock - oldProduct.stock;
    }
    
    // Create expense if stock was added
    if (addedStock > 0 && formData.cost > 0) {
       addExpenseFromStockPurchase(formData.name, addedStock, formData.cost);
    }

    const product: Product = {
      ...formData,
      id: formData.id || Date.now().toString(),
    };
    saveProduct(product);
    refresh();
    setShowForm(false);
    setFormData(initialFormState);
  };

  const handleEdit = (p: Product) => {
    setFormData(p);
    
    // Load history for this product
    const allTxs = getTransactions();
    const history = allTxs
      .filter(t => t.type === 'IN' && t.items?.some(item => item.id === p.id))
      .map(t => {
        const item = t.items!.find(item => item.id === p.id)!;
        return {
          date: t.date,
          qty: item.quantity,
          total: item.price * item.quantity
        };
      })
      .slice(0, 5); // Take last 5
    
    setProductHistory(history);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Hapus produk ini?')) {
      deleteProduct(id);
      refresh();
    }
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setProductHistory([]);
  }

  const filtered = products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="bg-white p-4 shadow-sm sticky top-0 z-10">
        <div className="flex justify-between items-center mb-4">
           <h1 className="text-2xl font-bold text-gray-800">Daftar Produk</h1>
           <button 
             onClick={() => { setFormData(initialFormState); setProductHistory([]); setShowForm(true); }}
             className="bg-brand-blue text-white p-2 rounded-lg flex items-center gap-1 text-sm font-medium shadow-md"
           >
             <Plus size={18} /> Tambah
           </button>
        </div>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input 
            type="text"
            placeholder="Cari nama barang..."
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-1 focus:ring-brand-blue outline-none text-sm"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="p-4 space-y-3">
        {filtered.map(p => (
          <div key={p.id} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex justify-between items-center">
            <div>
              <h3 className="font-semibold text-gray-800">{p.name}</h3>
              <p className="text-xs text-gray-500 mb-1">{p.category}</p>
              <div className="flex items-center gap-3 text-sm">
                <span className="text-brand-blue font-bold">{formatRupiah(p.price)}</span>
                <span className="text-gray-400 text-xs">Stok: {p.stock}</span>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => handleEdit(p)} className="p-2 bg-blue-50 text-brand-blue rounded-lg">
                <Edit2 size={16} />
              </button>
              <button onClick={() => handleDelete(p.id)} className="p-2 bg-red-50 text-red-500 rounded-lg">
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
        
        {filtered.length === 0 && (
          <div className="text-center py-10 text-gray-400">
            <p>Tidak ada produk ditemukan.</p>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-xl max-h-[90vh] overflow-y-auto">
             <div className="flex justify-between items-center mb-4">
               <h2 className="text-xl font-bold">{formData.id ? 'Edit Produk' : 'Tambah Produk'}</h2>
               <button onClick={handleCloseForm}><X className="text-gray-400" /></button>
             </div>
             
             <form onSubmit={handleSave} className="space-y-4">
               <div>
                 <label className="block text-sm font-medium text-gray-700 mb-1">Nama Produk</label>
                 <input required type="text" className="w-full border rounded-lg p-2" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
               </div>
               
               <div className="grid grid-cols-2 gap-4">
                 <div>
                   <label className="block text-sm font-medium text-gray-700 mb-1">Harga Jual</label>
                   <input required type="number" className="w-full border rounded-lg p-2" value={formData.price} onChange={e => setFormData({...formData, price: parseInt(e.target.value) || 0})} />
                 </div>
                 <div>
                   <label className="block text-sm font-medium text-gray-700 mb-1">Harga Modal</label>
                   <input required type="number" className="w-full border rounded-lg p-2" value={formData.cost} onChange={e => setFormData({...formData, cost: parseInt(e.target.value) || 0})} />
                 </div>
               </div>
               
               <div className="grid grid-cols-2 gap-4">
                 <div>
                   <label className="block text-sm font-medium text-gray-700 mb-1">Stok</label>
                   <input required type="number" className="w-full border rounded-lg p-2" value={formData.stock} onChange={e => setFormData({...formData, stock: parseInt(e.target.value) || 0})} />
                 </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Kategori</label>
                    <select className="w-full border rounded-lg p-2" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                      <option value="Umum">Umum</option>
                      <option value="Makanan">Makanan</option>
                      <option value="Minuman">Minuman</option>
                      <option value="Sembako">Sembako</option>
                      <option value="Rokok">Rokok</option>
                    </select>
                 </div>
               </div>

               <button type="submit" className="w-full bg-brand-blue text-white py-3 rounded-xl font-bold mt-4">
                 Simpan
               </button>
             </form>

             {/* Transaction History Section */}
             {formData.id && (
               <div className="mt-8 pt-6 border-t border-gray-100">
                 <h3 className="font-bold text-gray-800 mb-3">Riwayat Penjualan Terakhir</h3>
                 <div className="bg-gray-50 rounded-lg overflow-hidden">
                   <table className="w-full text-sm text-left">
                     <thead className="bg-gray-100 text-gray-600 font-medium">
                       <tr>
                         <th className="p-2">Tanggal</th>
                         <th className="p-2 text-center">Qty</th>
                         <th className="p-2 text-right">Total</th>
                       </tr>
                     </thead>
                     <tbody className="divide-y divide-gray-200">
                       {productHistory.map((h, idx) => (
                         <tr key={idx}>
                           <td className="p-2 text-gray-600">
                             {new Date(h.date).toLocaleDateString('id-ID', {day: 'numeric', month: 'short'})}
                           </td>
                           <td className="p-2 text-center font-medium">{h.qty}</td>
                           <td className="p-2 text-right text-brand-blue">{formatRupiah(h.total)}</td>
                         </tr>
                       ))}
                       {productHistory.length === 0 && (
                         <tr>
                           <td colSpan={3} className="p-4 text-center text-gray-400 italic">Belum ada penjualan</td>
                         </tr>
                       )}
                     </tbody>
                   </table>
                 </div>
               </div>
             )}

          </div>
        </div>
      )}
    </div>
  );
};

export default Products;