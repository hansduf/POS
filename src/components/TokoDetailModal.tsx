'use client';

import React, { useState } from 'react';
import {
  X,
  Store,
  User,
  Phone,
  MapPin,
  FileText,
  ShoppingBag,
  RefreshCw,
  Edit2,
  DollarSign,
  Calendar,
  CheckCircle2,
  Clock,
  ExternalLink,
  MessageCircle,
} from 'lucide-react';
import { TokoPerformance, Order, ProductReturn, Product, Toko } from '@/types';

const formatIDR = (val: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(
    val || 0
  );

interface TokoDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  toko: TokoPerformance | null;
  orders: Order[];
  returns: ProductReturn[];
  products: Product[];
  onSelectForOrder: (toko: Toko) => void;
  onOpenReturnModal: (tokoId: string) => void;
  onEditToko: (toko: Toko) => void;
  onOpenNota: (order: Order) => void;
  onOpenNotaRetur: (ret: ProductReturn) => void;
}

export const TokoDetailModal: React.FC<TokoDetailModalProps> = ({
  isOpen,
  onClose,
  toko,
  orders,
  returns,
  products,
  onSelectForOrder,
  onOpenReturnModal,
  onEditToko,
  onOpenNota,
  onOpenNotaRetur,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'orders' | 'returns'>('orders');

  if (!isOpen || !toko) return null;

  // Filter orders & returns for this specific toko
  const tokoOrders = orders.filter((o) => o.toko_id === toko.id);
  const tokoReturns = returns.filter((r) => r.toko_id === toko.id);

  const totalBelanja = toko.total_omset || 0;
  const totalReturNilai = tokoReturns.reduce((sum, r) => sum + r.total_nilai, 0);

  const handleOpenWhatsApp = () => {
    if (!toko.no_hp) return;
    let cleanPhone = toko.no_hp.replace(/\D/g, '');
    if (cleanPhone.startsWith('0')) {
      cleanPhone = '62' + cleanPhone.substring(1);
    }
    const msg = encodeURIComponent(`Halo ${toko.nama_pemilik} (${toko.nama_toko}), distributor JOSJIS mau konfirmasi pesanan...`);
    window.open(`https://wa.me/${cleanPhone}?text=${msg}`, '_blank');
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 z-50 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header Modal */}
        <div className="bg-slate-900 text-white p-4 flex items-start justify-between relative shrink-0">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-500 text-white uppercase tracking-wider">
                {toko.lokasi_pasar}
              </span>
              {toko.sisa_piutang > 0 && (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-rose-500 text-white uppercase tracking-wider">
                  Ada Tempo: {formatIDR(toko.sisa_piutang)}
                </span>
              )}
            </div>
            <h2 className="text-xl font-extrabold flex items-center gap-2 leading-tight">
              <Store className="w-5 h-5 text-emerald-400" />
              {toko.nama_toko}
            </h2>
            <p className="text-xs text-slate-300 flex items-center gap-2 font-medium">
              <User className="w-3.5 h-3.5 text-slate-400" /> Pemilik: <strong className="text-white">{toko.nama_pemilik}</strong>
              {toko.no_hp && (
                <>
                  • <Phone className="w-3.5 h-3.5 text-slate-400" /> {toko.no_hp}
                </>
              )}
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Toolbar */}
        <div className="bg-slate-100 p-2.5 border-b border-slate-200 flex items-center justify-between gap-2 overflow-x-auto scrollbar-none shrink-0">
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onClose();
                onSelectForOrder(toko);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-xs transition-all active:scale-95 whitespace-nowrap"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>+ Order Baru</span>
            </button>

            <button
              onClick={() => {
                onClose();
                onOpenReturnModal(toko.id);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-xs rounded-xl shadow-xs transition-all active:scale-95 whitespace-nowrap"
            >
              <RefreshCw className="w-4 h-4" />
              <span>🔄 Retur Barang</span>
            </button>

            <button
              onClick={() => {
                onClose();
                onEditToko(toko);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-700 hover:bg-slate-800 text-white font-extrabold text-xs rounded-xl shadow-xs transition-all active:scale-95 whitespace-nowrap"
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span>Edit Data</span>
            </button>
          </div>

          {toko.no_hp && (
            <button
              onClick={handleOpenWhatsApp}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white font-extrabold text-xs rounded-xl shadow-xs transition-all active:scale-95 whitespace-nowrap shrink-0"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Chat WA</span>
            </button>
          )}
        </div>

        {/* Body Content - Scrollable */}
        <div className="p-4 space-y-4 overflow-y-auto flex-1">
          {/* Metadata Card */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div>
              <span className="text-[10px] text-slate-500 font-bold block uppercase">Total Omset</span>
              <span className="font-extrabold text-slate-900 text-sm">{formatIDR(totalBelanja)}</span>
            </div>

            <div>
              <span className="text-[10px] text-slate-500 font-bold block uppercase">Jumlah Order</span>
              <span className="font-extrabold text-slate-900 text-sm">{tokoOrders.length} Transaksi</span>
            </div>

            <div>
              <span className="text-[10px] text-slate-500 font-bold block uppercase">Total Retur</span>
              <span className="font-extrabold text-amber-900 text-sm">{formatIDR(totalReturNilai)}</span>
            </div>

            <div>
              <span className="text-[10px] text-slate-500 font-bold block uppercase">Sisa Piutang</span>
              <span
                className={`font-black text-sm ${
                  toko.sisa_piutang > 0 ? 'text-rose-600' : 'text-emerald-700'
                }`}
              >
                {formatIDR(toko.sisa_piutang)}
              </span>
            </div>
          </div>

          {/* Sub-Tab Navigation Header */}
          <div className="flex items-center border-b border-slate-200 text-xs gap-1">
            <button
              onClick={() => setActiveSubTab('orders')}
              className={`py-2 px-3 font-extrabold transition-all relative whitespace-nowrap text-center ${
                activeSubTab === 'orders'
                  ? 'text-emerald-700 border-b-2 border-emerald-600 -mb-px'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              📄 Riwayat Nota Penjualan ({tokoOrders.length})
            </button>

            <button
              onClick={() => setActiveSubTab('returns')}
              className={`py-2 px-3 font-extrabold transition-all relative whitespace-nowrap text-center ${
                activeSubTab === 'returns'
                  ? 'text-emerald-700 border-b-2 border-emerald-600 -mb-px'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              🔄 Riwayat Retur Barang ({tokoReturns.length})
            </button>
          </div>

          {/* SUB-TAB 1: RIWAYAT NOTA PENJUALAN */}
          {activeSubTab === 'orders' && (
            <div className="space-y-2">
              {tokoOrders.length === 0 ? (
                <div className="text-center py-10 text-slate-400 space-y-1">
                  <FileText className="w-8 h-8 mx-auto text-slate-300" />
                  <p className="text-xs font-bold text-slate-600">Belum ada riwayat transaksi nota toko ini</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden bg-white shadow-xs">
                  {tokoOrders.map((ord) => (
                    <div key={ord.id} className="p-3 hover:bg-slate-50 transition-colors flex items-center justify-between gap-3 text-xs">
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono font-black text-slate-900">{ord.no_nota}</span>
                          <span className="text-[10px] text-slate-400 font-mono">({ord.tanggal_pengiriman})</span>
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-black ${
                              ord.status_pembayaran === 'Lunas'
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                : 'bg-rose-100 text-rose-800 border border-rose-300'
                            }`}
                          >
                            {ord.status_pembayaran}
                          </span>
                        </div>

                        <p className="text-[11px] text-slate-600 font-medium">
                          {(ord.items || []).map((i) => `${i.product?.nama_produk || 'Produk'} (${i.jumlah}x)`).join(', ')}
                        </p>
                      </div>

                      <div className="text-right space-y-1 shrink-0">
                        <span className="font-black text-slate-900 text-xs block">{formatIDR(ord.total_bayar)}</span>
                        <button
                          onClick={() => {
                            onClose();
                            onOpenNota(ord);
                          }}
                          className="px-2 py-1 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-[10px] rounded-lg shadow-xs flex items-center gap-1 ml-auto"
                        >
                          <span>📄 Struk Nota</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* SUB-TAB 2: RIWAYAT RETUR BARANG */}
          {activeSubTab === 'returns' && (
            <div className="space-y-2">
              {tokoReturns.length === 0 ? (
                <div className="text-center py-10 text-slate-400 space-y-1">
                  <RefreshCw className="w-8 h-8 mx-auto text-slate-300" />
                  <p className="text-xs font-bold text-slate-600">Belum ada riwayat retur barang toko ini</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden bg-white shadow-xs">
                  {tokoReturns.map((ret) => {
                    const prod = products.find((p) => p.id === ret.product_id) || ret.product;
                    return (
                      <div key={ret.id} className="p-3 hover:bg-slate-50 transition-colors flex items-center justify-between gap-3 text-xs">
                        <div className="space-y-1 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-mono font-black text-amber-900 bg-amber-100 px-2 py-0.5 rounded border border-amber-300 text-[10px]">
                              {ret.no_nota_retur || 'RET-001'}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono">Tgl: {ret.tanggal}</span>
                            <span className="px-2 py-0.5 rounded text-[10px] font-black bg-rose-100 text-rose-800 border border-rose-300">
                              {ret.alasan}
                            </span>
                          </div>

                          <p className="text-xs font-bold text-slate-800">
                            {prod?.nama_produk || 'Produk'} • {ret.jumlah} {prod?.satuan || 'Pcs'} @ {formatIDR(ret.harga_nilai)}
                          </p>

                          <p className="text-[10px] text-teal-800 font-extrabold">
                            Solusi: {ret.tindakan} {ret.catatan ? `• ${ret.catatan}` : ''}
                          </p>
                        </div>

                        <div className="text-right space-y-1 shrink-0">
                          <span className="font-black text-amber-900 text-xs block">{formatIDR(ret.total_nilai)}</span>
                          <button
                            onClick={() => {
                              onClose();
                              onOpenNotaRetur(ret);
                            }}
                            className="px-2 py-1 bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-[10px] rounded-lg shadow-xs flex items-center gap-1 ml-auto"
                          >
                            <span>📄 Struk Retur</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
