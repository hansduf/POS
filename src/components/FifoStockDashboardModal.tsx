'use client';

import React from 'react';
import { Product, Purchase, Order, FifoAssetSummary } from '@/types';
import { StoreManager } from '@/lib/store';
import { X, TrendingUp, Package, Layers, DollarSign, ArrowUpRight, CheckCircle2 } from 'lucide-react';

interface FifoStockDashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  purchases: Purchase[];
  orders: Order[];
}

export const FifoStockDashboardModal: React.FC<FifoStockDashboardModalProps> = ({
  isOpen,
  onClose,
  products,
  purchases,
  orders,
}) => {
  if (!isOpen) return null;

  const formatIDR = (val: number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(
      val
    );

  const summary: FifoAssetSummary = StoreManager.getFifoAssetSummary(products, purchases, orders);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl text-slate-900 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-slate-900 text-white shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-600 flex items-center justify-center font-black text-white">
              📊
            </div>
            <div>
              <h3 className="font-extrabold text-base leading-tight">Dashboard Aset Barang & Laba FIFO</h3>
              <p className="text-[11px] text-slate-400 font-medium">Analisis Nilai Modal Gudang & Pendapatan Bersih Pasti</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 space-y-4 overflow-y-auto text-xs flex-1 bg-slate-50">
          {/* Top 3 Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Card 1: Total Aset Modal Barang */}
            <div className="bg-white border border-slate-200 p-3.5 rounded-2xl shadow-xs space-y-1">
              <div className="flex items-center justify-between text-slate-500">
                <span className="font-bold text-[10px] uppercase">📦 Aset Uang Barang</span>
                <Package className="w-4 h-4 text-emerald-700" />
              </div>
              <h4 className="font-black text-lg text-slate-900">{formatIDR(summary.totalAsetModalStok)}</h4>
              <p className="text-[10px] text-slate-500 font-medium">
                Total modal tersimpan dari {products.reduce((sum, p) => sum + p.stok, 0)} item stok gudang.
              </p>
            </div>

            {/* Card 2: Potensi Nilai Jual & Margin */}
            <div className="bg-white border border-slate-200 p-3.5 rounded-2xl shadow-xs space-y-1">
              <div className="flex items-center justify-between text-slate-500">
                <span className="font-bold text-[10px] uppercase">🏷️ Potensi Omset Gudang</span>
                <TrendingUp className="w-4 h-4 text-amber-600" />
              </div>
              <h4 className="font-black text-lg text-slate-900">{formatIDR(summary.totalPotensiOmset)}</h4>
              <p className="text-[10px] text-emerald-800 font-bold">
                + Potensi Margin: {formatIDR(summary.potensiMarginGudang)}
              </p>
            </div>

            {/* Card 3: Laba Bersih Pasti (Net Profit) */}
            <div className="bg-emerald-600 text-white p-3.5 rounded-2xl shadow-md space-y-1">
              <div className="flex items-center justify-between opacity-90">
                <span className="font-bold text-[10px] uppercase">💰 Laba Bersih Pasti</span>
                <CheckCircle2 className="w-4 h-4 text-amber-300" />
              </div>
              <h4 className="font-black text-xl text-white">{formatIDR(summary.labaBersihPasti)}</h4>
              <p className="text-[10px] opacity-80 leading-tight">
                Net Profit dari Penjualan Lunas ({formatIDR(summary.totalLunasOmset)} omset - {formatIDR(summary.totalHppLunasFifo)} HPP FIFO).
              </p>
            </div>
          </div>

          {/* Section: Batch FIFO Restock History */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h4 className="font-extrabold text-slate-900 text-xs flex items-center gap-1.5 uppercase">
                <Layers className="w-4 h-4 text-emerald-700" />
                Daftar Batch Restock FIFO (Supplier)
              </h4>
              <span className="text-[11px] font-bold text-slate-500">
                Total {purchases.length} Restock Batch
              </span>
            </div>

            {purchases.length === 0 ? (
              <div className="text-center py-8 text-slate-500 space-y-1">
                <Package className="w-8 h-8 text-slate-300 mx-auto" />
                <p className="font-bold text-xs text-slate-700">Belum ada catatan restock batch dari supplier</p>
                <p className="text-[10px] text-slate-400">Gunakan tombol "+ Restock Supplier" untuk mencatat belanja stok baru.</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 overflow-x-auto">
                <table className="w-full text-left text-[11px]">
                  <thead>
                    <tr className="text-slate-500 font-extrabold border-b border-slate-200 pb-1 uppercase text-[10px]">
                      <th className="py-2 pr-2">Tgl Beli</th>
                      <th className="py-2 px-2">Produk</th>
                      <th className="py-2 px-2">Supplier</th>
                      <th className="py-2 px-2 text-center">Masuk</th>
                      <th className="py-2 px-2 text-center">Sisa Lot</th>
                      <th className="py-2 px-2 text-right">Harga Modal</th>
                      <th className="py-2 pl-2 text-right">Nilai Aset</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {purchases.map((p) => {
                      const prod = products.find((pr) => pr.id === p.product_id) || p.product;
                      const sisaAssetValue = p.sisa_stok * p.harga_modal_beli;

                      return (
                        <tr key={p.id} className="hover:bg-slate-50 font-medium">
                          <td className="py-2 pr-2 font-mono font-bold text-slate-700">{p.tanggal_beli}</td>
                          <td className="py-2 px-2 font-black text-slate-900">
                            {prod?.nama_produk || 'Produk'}
                          </td>
                          <td className="py-2 px-2 font-bold text-slate-600">{p.supplier_nama}</td>
                          <td className="py-2 px-2 text-center font-bold text-slate-800">
                            {p.jumlah_masuk} {prod?.satuan || 'Pcs'}
                          </td>
                          <td className="py-2 px-2 text-center">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-black ${
                                p.sisa_stok > 0
                                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                  : 'bg-slate-100 text-slate-500'
                              }`}
                            >
                              {p.sisa_stok} {prod?.satuan || 'Pcs'}
                            </span>
                          </td>
                          <td className="py-2 px-2 text-right font-bold text-slate-800">
                            {formatIDR(p.harga_modal_beli)}
                          </td>
                          <td className="py-2 pl-2 text-right font-black text-emerald-800">
                            {formatIDR(sisaAssetValue)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 bg-white border-t border-slate-200 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-extrabold rounded-xl text-xs shadow-sm"
          >
            Tutup Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};
