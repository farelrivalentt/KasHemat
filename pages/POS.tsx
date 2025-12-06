import React, { useState, useEffect } from 'react';
import { Search, ShoppingCart, Plus, Minus, Trash2, X, Printer } from 'lucide-react';
import { Product, CartItem, Transaction } from '../types';
import { getProducts, formatRupiah, saveTransaction } from '../services/storage';

const POS: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCheckout, setShowCheckout] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState<string>('');
  const [successModal, setSuccessModal] = useState(false);
  const [lastTransaction, setLastTransaction] = useState<Transaction | null>(null);

  useEffect(() => {
    setProducts(getProducts());
  }, []);

  const addToCart = (product: Product) => {
    if (product.stock <= 0) return;
    
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        if (existing.quantity >= product.stock) return prev;
        return prev.map(item => 
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.id !== productId));
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart(prev => {
      return prev.map(item => {
        if (item.id === productId) {
          const newQty = item.quantity + delta;
          const product = products.find(p => p.id === productId);
          if (newQty < 1) return item;
          if (product && newQty > product.stock) return item;
          return { ...item, quantity: newQty };
        }
        return item;
      });
    });
  };

  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  
  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCheckout = () => {
    const cash = parseFloat(paymentAmount.replace(/\./g, ''));
    if (isNaN(cash) || cash < cartTotal) {
      alert('Uang pembayaran kurang!');
      return;
    }

    const transaction: Transaction = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      type: 'IN',
      total: cartTotal,
      items: cart,
    };

    saveTransaction(transaction);
    setLastTransaction({ ...transaction, note: cash.toString() }); // Store cash amount in note temporarily or use logic below
    setSuccessModal(true);
    setShowCheckout(false);
    
    // Reset state
    setCart([]);
    setPaymentAmount('');
    setProducts(getProducts()); // Refresh stock display
  };
  
  const handlePrint = () => {
    if (!lastTransaction) return;
    
    const cash = parseFloat(paymentAmount || lastTransaction.note || '0');
    const change = cash - lastTransaction.total;
    
    // Create print content
    const printContent = `
      <div style="font-family: monospace; text-align: center; max-width: 300px; margin: 0 auto;">
        <h2 style="margin: 0; font-size: 24px; font-weight: bold;">Warung Berkah</h2>
        <p style="margin: 5px 0 15px 0; font-size: 12px;">Jl. Raya Makmur No. 12, Jakarta</p>
        <hr style="border-top: 1px dashed black; margin: 10px 0;">
        <div style="text-align: left; margin-bottom: 10px;">
          <p style="margin: 2px 0;">Tgl: ${new Date(lastTransaction.date).toLocaleString('id-ID')}</p>
          <p style="margin: 2px 0;">No: ${lastTransaction.id.substr(-6)}</p>
        </div>
        <hr style="border-top: 1px dashed black; margin: 10px 0;">
        <table style="width: 100%; font-size: 12px;">
          ${lastTransaction.items?.map(item => `
            <tr>
              <td colspan="3" style="padding-top: 4px;">${item.name}</td>
            </tr>
            <tr>
              <td style="padding-bottom: 4px;">${item.quantity} x ${formatRupiah(item.price)}</td>
              <td style="text-align: right; padding-bottom: 4px;">${formatRupiah(item.quantity * item.price)}</td>
            </tr>
          `).join('')}
        </table>
        <hr style="border-top: 1px dashed black; margin: 10px 0;">
        <div style="display: flex; justify-content: space-between; font-weight: bold; font-size: 14px;">
          <span>Total</span>
          <span>${formatRupiah(lastTransaction.total)}</span>
        </div>
        ${!isNaN(cash) ? `
        <div style="display: flex; justify-content: space-between; font-size: 12px; margin-top: 5px;">
          <span>Tunai</span>
          <span>${formatRupiah(cash)}</span>
        </div>
        <div style="display: flex; justify-content: space-between; font-size: 12px; margin-top: 2px;">
          <span>Kembali</span>
          <span>${formatRupiah(change)}</span>
        </div>
        ` : ''}
        <hr style="border-top: 1px dashed black; margin: 10px 0;">
        <p style="margin-top: 20px; font-size: 12px;">Terima Kasih!</p>
        <p style="font-size: 10px;">Powered by KasHemat</p>
      </div>
    `;
    
    const printArea = document.getElementById('print-area');
    if (printArea) {
      printArea.innerHTML = printContent;
      window.print();
    }
  };

  const getCashAmount = () => {
    // Only available before modal close/state reset ideally, but saved in lastTransaction.note hacked way or we rely on user input state if not cleared (but we cleared it).
    // Actually, in handleCheckout we setLastTransaction BEFORE clearing paymentAmount. 
    // Wait, in handleCheckout I cleared paymentAmount AFTER setLastTransaction. 
    // BUT lastTransaction state doesn't store 'cash' amount by default in Transaction type unless I add a field. 
    // I hacked it into 'note' above: setLastTransaction({ ...transaction, note: cash.toString() });
    return lastTransaction?.note ? parseFloat(lastTransaction.note) : 0;
  };
  
  const lastChange = lastTransaction ? getCashAmount() - lastTransaction.total : 0;

  return (
    <div className="flex flex-col h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-brand-blue p-4 shadow-md z-10">
        <h1 className="text-white font-bold text-xl mb-3">Kasir</h1>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input 
            type="text"
            placeholder="Cari produk..."
            className="w-full pl-10 pr-4 py-3 rounded-xl focus:outline-none text-gray-800 shadow-inner"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Product Grid */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="grid grid-cols-2 gap-4">
          {filteredProducts.map(product => (
            <div 
              key={product.id} 
              onClick={() => addToCart(product)}
              className={`bg-white p-3 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between h-32 relative active:scale-95 transition-transform ${product.stock === 0 ? 'opacity-60 grayscale' : ''}`}
            >
              <div>
                <h3 className="font-semibold text-gray-800 line-clamp-2 leading-tight">{product.name}</h3>
                <p className="text-xs text-gray-500 mt-1">Stok: {product.stock}</p>
              </div>
              <div className="flex justify-between items-end mt-2">
                <span className="font-bold text-brand-blue">{formatRupiah(product.price)}</span>
                <div className="bg-blue-50 p-1.5 rounded-full">
                  <Plus className="w-4 h-4 text-brand-blue" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Cart Summary Bar */}
      {cart.length > 0 && (
        <div className="fixed bottom-20 left-4 right-4 bg-white rounded-xl shadow-xl border border-gray-100 p-4 z-20 animate-bounce-in">
          <div className="flex justify-between items-center mb-3">
             <div className="flex items-center gap-2">
                <div className="bg-brand-orange text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm">
                  {cart.reduce((a, b) => a + b.quantity, 0)}
                </div>
                <span className="text-gray-600 font-medium text-sm">Item dikeranjang</span>
             </div>
             <span className="font-bold text-xl text-gray-800">{formatRupiah(cartTotal)}</span>
          </div>
          <button 
            onClick={() => setShowCheckout(true)}
            className="w-full bg-brand-blue text-white py-3 rounded-lg font-bold shadow-md active:bg-brand-dark"
          >
            Bayar Sekarang
          </button>
        </div>
      )}

      {/* Checkout Modal */}
      {showCheckout && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center">
          <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl animate-slide-up">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-800">Detail Pembayaran</h2>
              <button onClick={() => setShowCheckout(false)}><X className="text-gray-400" /></button>
            </div>

            <div className="max-h-60 overflow-y-auto mb-4 space-y-3">
              {cart.map(item => (
                <div key={item.id} className="flex justify-between items-center">
                   <div className="flex-1">
                     <p className="text-sm font-medium text-gray-800">{item.name}</p>
                     <p className="text-xs text-brand-blue">{formatRupiah(item.price)}</p>
                   </div>
                   <div className="flex items-center gap-3">
                     <button onClick={() => updateQuantity(item.id, -1)} className="p-1 bg-gray-100 rounded text-gray-600"><Minus size={14}/></button>
                     <span className="w-4 text-center text-sm font-medium">{item.quantity}</span>
                     <button onClick={() => updateQuantity(item.id, 1)} className="p-1 bg-gray-100 rounded text-gray-600"><Plus size={14}/></button>
                     <button onClick={() => removeFromCart(item.id)} className="ml-2 text-red-500"><Trash2 size={16}/></button>
                   </div>
                </div>
              ))}
            </div>

            <div className="border-t border-gray-100 pt-4 mb-4">
               <div className="flex justify-between text-lg font-bold mb-4">
                 <span>Total Tagihan</span>
                 <span className="text-brand-blue">{formatRupiah(cartTotal)}</span>
               </div>
               
               <label className="block text-sm text-gray-500 mb-2">Uang Diterima</label>
               <input 
                 type="number" 
                 placeholder="0"
                 className="w-full border border-gray-300 rounded-xl p-3 text-lg font-semibold focus:ring-2 focus:ring-brand-blue outline-none"
                 value={paymentAmount}
                 onChange={(e) => setPaymentAmount(e.target.value)}
               />
               
               <div className="flex gap-2 mt-3">
                 {[10000, 20000, 50000, 100000].map(amt => (
                   <button 
                     key={amt}
                     onClick={() => setPaymentAmount(amt.toString())}
                     className="flex-1 bg-gray-100 py-2 rounded-lg text-xs font-medium hover:bg-gray-200 text-gray-600"
                   >
                     {amt/1000}k
                   </button>
                 ))}
               </div>
            </div>

            <button 
              onClick={handleCheckout}
              disabled={!paymentAmount}
              className="w-full bg-brand-orange text-white py-4 rounded-xl font-bold shadow-lg disabled:opacity-50"
            >
              Proses Pembayaran
            </button>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {successModal && lastTransaction && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl">
             <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
               <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                 <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
               </div>
             </div>
             <h2 className="text-2xl font-bold text-gray-800 mb-2">Pembayaran Berhasil!</h2>
             <p className="text-gray-500 text-sm mb-6">Transaksi telah disimpan ke riwayat.</p>
             
             <div className="bg-gray-50 rounded-xl p-4 mb-6">
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <span>Total</span>
                  <span>{formatRupiah(lastTransaction.total)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold text-brand-blue">
                  <span>Kembalian</span>
                  <span>{formatRupiah(lastChange)}</span>
                </div>
             </div>
             
             <button 
               onClick={handlePrint}
               className="w-full border-2 border-brand-blue text-brand-blue py-3 rounded-xl font-bold mb-3 flex items-center justify-center gap-2 hover:bg-blue-50"
             >
               <Printer size={20} /> Cetak Struk
             </button>

             <button 
               onClick={() => setSuccessModal(false)}
               className="w-full bg-brand-blue text-white py-3 rounded-xl font-bold"
             >
               Transaksi Baru
             </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default POS;