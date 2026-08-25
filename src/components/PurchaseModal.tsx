'use client';

import React, { useState } from 'react';
import { Product } from '@/types';
import { X, PlusCircle, PackageCheck, Building2, Calendar, DollarSign } from 'lucide-react';
import confetti from 'canvas-confetti';

interface PurchaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  onSavePurchase: (purchaseData: {
    product_id: string;
    supplier_nama: string;
    jumlah_masuk: number;
    harga_modal_beli: number;
    tanggal_beli: string;
  }) => Promise<void>;
}

export const PurchaseModal: React.FC<PurchaseModalProps> = ({
  isOpen,
  onClose,
  products,
  onSavePurchase,
}) => {
  const todayStr = new Date().toISOString().split('T')[0];

  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [supplierNama, setSupplierNama] = useState<string>('Supplier Utama');
  const [jumlahMasuk, setJumlahMasuk] = useState<number>(10);
  const [hargaModalBeli, setHargaModalBeli] = useState<number>(0);
  const [tanggalBeli, setTanggalBeli] = useState<string>(todayStr);
  const [isSubmitting, setIsSubmitting] = useState(false);

  React.useEffect(() => {
    if (isOpen && products.length > 0) {
      const currentExists = products.some((p) => p.id === selectedProductId);
      if (!selectedProductId || !currentExists) {
        const firstProd = products[0];
        setSelectedProductId(firstProd.id);
        setHargaModalBeli(firstProd.harga_modal);
      }
    }
  }, [isOpen, products, selectedProductId]);

  if (!isOpen) return null;

  const selectedProduct = products.find((p) => p.id === selectedProductId) || products[0];

  const formatIDR = (val: number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(
      val
    );

  const totalBelanja = jumlahMasuk * (hargaModalBeli || selectedProduct?.harga_modal || 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const activeProductId = selectedProductId || products[0]?.id;

    if (!activeProductId) {
      alert('Pilih produk yang di-restock');
      return;
    }
    if (jumlahMasuk <= 0) {
      alert('Jumlah masuk harus lebih dari 0');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSavePurchase({
        product_id: activeProductId,
        supplier_nama: supplierNama.trim() || 'Supplier Utama',
        jumlah_masuk: jumlahMasuk,
        harga_modal_beli: hargaModalBeli || selectedProduct?.harga_modal || 0,
        tanggal_beli: tanggalBeli,
      });

      confetti({ particleCount: 60, spread: 50, origin: { y: 0.6 } });
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal menyimpan restock';
      alert(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl text-slate-900 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-emerald-700 text-white shrink-0">
          <div className="flex items-center gap-2">
            <PackageCheck className="w-5 h-5" />
            <div>
              <h3 className="font-extrabold text-sm leading-tight">Restock Barang Supplier (FIFO)</h3>
              <p className="text-[10px] text-emerald-100 font-medium">Input Belanja Stok Pabrik / Agen</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-emerald-100 hover:text-white hover:bg-emerald-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 space-y-3 text-xs overflow-y-auto max-h-[80vh]">
          {/* Select Product */}
          <div>
            <label className="block font-extrabold text-slate-700 mb-1">Pilih Produk Restock *</label>
            <select
              value={selectedProductId}
              onChange={(e) => {
                const pid = e.target.value;
                setSelectedProductId(pid);
                const prod = products.find((p) => p.id === pid);
                if (prod) setHargaModalBeli(prod.harga_modal);
              }}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900 focus:outline-none focus:border-emerald-600"
              required
            >
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nama_produk} (Stok Gudang: {p.stok} {p.satuan})
                </option>
              ))}
            </select>
          </div>

          {/* Supplier Name & Date */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block font-extrabold text-slate-700 mb-1 flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5 text-slate-500" />
                Nama Supplier
              </label>
              <input
                type="text"
                placeholder="PT Sembako Utama"
                value={supplierNama}
                onChange={(e) => setSupplierNama(e.target.value)}
                className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-slate-900 font-bold"
                required
              />
            </div>

            <div>
              <label className="block font-extrabold text-slate-700 mb-1 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-500" />
                Tanggal Beli
              </label>
              <input
                type="date"
                value={tanggalBeli}
                onChange={(e) => setTanggalBeli(e.target.value)}
                className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-xl font-bold text-slate-900"
                required
              />
            </div>
          </div>

          {/* Quantity & Modal Price */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block font-extrabold text-slate-700 mb-1">
                Jumlah Masuk ({selectedProduct?.satuan || 'Pcs'}) *
              </label>
              <input
                type="number"
                min="1"
                value={jumlahMasuk}
                onChange={(e) => setJumlahMasuk(Number(e.target.value))}
                className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-slate-900 font-black"
                required
              />
            </div>

            <div>
              <label className="block font-extrabold text-slate-700 mb-1 flex items-center gap-1">
                <DollarSign className="w-3.5 h-3.5 text-emerald-700" />
                Harga Beli Modal (Rp) *
              </label>
              <input
                type="number"
                min="0"
                step="any"
                value={hargaModalBeli}
                onChange={(e) => setHargaModalBeli(Number(e.target.value))}
                className="w-full px-3 py-1.5 bg-white border border-emerald-400 rounded-xl text-slate-900 font-black"
                required
              />
            </div>
          </div>

          {/* Summary Box */}
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl space-y-1">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-slate-700">Total Belanja Batch Restock:</span>
              <span className="font-black text-emerald-800 text-sm">{formatIDR(totalBelanja)}</span>
            </div>
            <p className="text-[10px] text-slate-500 italic">
              * Stok barang akan bertambah {jumlahMasuk} {selectedProduct?.satuan} dan dicatat sebagai Lot FIFO terpisah.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-600 font-bold hover:text-slate-900"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-1.5 px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl shadow-sm active:scale-95 transition-all disabled:opacity-50"
            >
              <PlusCircle className="w-4 h-4" />
              <span>{isSubmitting ? 'Menyimpan...' : 'Simpan Restock FIFO'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
