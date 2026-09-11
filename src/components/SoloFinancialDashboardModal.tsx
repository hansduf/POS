'use client';

import React, { useState } from 'react';
import { Order, Purchase, Expense, OwnerDraw, ProductReturn, Product, SoloFinancialBuckets } from '@/types';
import { StoreManager } from '@/lib/store';
import {
  X,
  Wallet,
  Package,
  Fuel,
  DollarSign,
  Plus,
  ArrowDownRight,
  Receipt,
  Layers,
  CheckCircle2,
} from 'lucide-react';

interface SoloFinancialDashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  orders: Order[];
  purchases: Purchase[];
  expenses: Expense[];
  ownerDraws: OwnerDraw[];
  returns?: ProductReturn[];
  products?: Product[];
  onOpenExpenseModal: () => void;
  onOpenPurchaseModal: () => void;
  onOpenOwnerDrawModal: () => void;
}

export const SoloFinancialDashboardModal: React.FC<SoloFinancialDashboardModalProps> = ({
  isOpen,
  onClose,
  orders,
  purchases,
  expenses,
  ownerDraws,
  returns = [],
  products = [],
  onOpenExpenseModal,
  onOpenPurchaseModal,
  onOpenOwnerDrawModal,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'buckets' | 'history_exp' | 'history_draw'>('buckets');

  if (!isOpen) return null;

  const formatIDR = (val: number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(
      val
    );

  const buckets: SoloFinancialBuckets = StoreManager.getSoloFinancialBuckets(
    orders,
    purchases,
    expenses,
    ownerDraws,
    returns,
    products
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-3xl lg:max-w-4xl xl:max-w-5xl overflow-hidden shadow-2xl text-slate-900 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-slate-900 text-white shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center font-black text-white">
              💰
            </div>
            <div>
              <h3 className="font-extrabold text-base leading-tight">Pos Keuangan Solo Distributor (Opsi A)</h3>
              <p className="text-[11px] text-slate-400 font-medium">
                100% Proteksi Modal Restock + Alokasi Margin Laba Kotor
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Action Navigation Bar */}
        <div className="bg-slate-100 p-2 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-1">
            <button
              onClick={() => setActiveSubTab('buckets')}
              className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all ${
                activeSubTab === 'buckets'
                  ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              3 Kantong Keuangan (Opsi A)
            </button>
            <button
              onClick={() => setActiveSubTab('history_exp')}
              className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all ${
                activeSubTab === 'history_exp'
                  ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Riwayat Operasional ({expenses.length})
            </button>
            <button
              onClick={() => setActiveSubTab('history_draw')}
              className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all ${
                activeSubTab === 'history_draw'
                  ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Riwayat Tarik Gaji ({ownerDraws.length})
            </button>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={onOpenExpenseModal}
              className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white font-extrabold rounded-lg text-[11px] flex items-center gap-1 shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Operasional</span>
            </button>
            <button
              onClick={onOpenPurchaseModal}
              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-lg text-[11px] flex items-center gap-1 shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Restock Supplier</span>
            </button>
            <button
              onClick={onOpenOwnerDrawModal}
              className="px-2.5 py-1 bg-blue-700 hover:bg-blue-800 text-white font-extrabold rounded-lg text-[11px] flex items-center gap-1 shadow-xs"
            >
              <ArrowDownRight className="w-3.5 h-3.5" />
              <span>+ Tarik Gaji</span>
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-5 space-y-4 overflow-y-auto text-xs flex-1 bg-slate-50">
          {activeSubTab === 'buckets' && (
            <div className="space-y-4">
              {/* Total Omset Lunas Banner */}
              <div className="bg-slate-900 text-white p-4 rounded-2xl shadow-xs flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">
                    Net Omset Terkumpul (Penjualan Lunas - Retur)
                  </span>
                  <h3 className="text-2xl font-black text-white">{formatIDR(buckets.totalOmsetLunas)}</h3>
                  <p className="text-[11px] text-emerald-400 font-medium">
                    Telah diproteksi 100% modal stok + pembagian laba kotor
                  </p>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-emerald-600/30 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-black text-xl">
                  💵
                </div>
              </div>

              {/* 3 Buckets Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Bucket 1: Restock Supplier */}
                <div className="bg-white border-2 border-emerald-500/40 p-4 rounded-2xl shadow-xs space-y-2 relative overflow-hidden">
                  <div className="flex items-center justify-between text-emerald-800">
                    <span className="font-extrabold text-[11px] uppercase tracking-tight flex items-center gap-1">
                      <Package className="w-4 h-4 text-emerald-600" />
                      1. Modal Restock
                    </span>
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 font-black px-1.5 py-0.5 rounded">
                      100% COGS
                    </span>
                  </div>
                  <h4 className="font-black text-xl text-slate-900">{formatIDR(buckets.posModalBelanjaStok)}</h4>
                  <div className="text-[10px] text-slate-500 space-y-0.5 pt-1 border-t border-slate-100">
                    <div className="flex justify-between">
                      <span>Sudah Belanja Restock:</span>
                      <span className="font-bold text-slate-800">{formatIDR(buckets.totalPembelianRestock)}</span>
                    </div>
                    <p className="text-emerald-800 font-extrabold italic">
                      * Uang modal asli 100% aman untuk beli stok ke supplier.
                    </p>
                  </div>
                </div>

                {/* Bucket 2: Operasional Lapangan */}
                <div className="bg-white border-2 border-amber-500/40 p-4 rounded-2xl shadow-xs space-y-2 relative overflow-hidden">
                  <div className="flex items-center justify-between text-amber-800">
                    <span className="font-extrabold text-[11px] uppercase tracking-tight flex items-center gap-1">
                      <Fuel className="w-4 h-4 text-amber-600" />
                      2. Operasional Lapangan
                    </span>
                    <span className="text-[10px] bg-amber-100 text-amber-800 font-black px-1.5 py-0.5 rounded">
                      60% Laba
                    </span>
                  </div>
                  <h4 className="font-black text-xl text-slate-900">{formatIDR(buckets.posOperasional)}</h4>
                  <div className="text-[10px] text-slate-500 space-y-0.5 pt-1 border-t border-slate-100">
                    <div className="flex justify-between">
                      <span>Sudah Terpakai (BBM/Makan):</span>
                      <span className="font-bold text-slate-800">
                        {formatIDR(buckets.totalPengeluaranOperasional)}
                      </span>
                    </div>
                    <p className="text-amber-800 font-extrabold italic">
                      * Bensin, Tol, Makan Jalan, & Servis Motor.
                    </p>
                  </div>
                </div>

                {/* Bucket 3: Gaji Pribadi Owner */}
                <div className="bg-white border-2 border-blue-500/40 p-4 rounded-2xl shadow-xs space-y-2 relative overflow-hidden">
                  <div className="flex items-center justify-between text-blue-800">
                    <span className="font-extrabold text-[11px] uppercase tracking-tight flex items-center gap-1">
                      <Wallet className="w-4 h-4 text-blue-600" />
                      3. Gaji / Profit Owner
                    </span>
                    <span className="text-[10px] bg-blue-100 text-blue-800 font-black px-1.5 py-0.5 rounded">
                      40% Laba
                    </span>
                  </div>
                  <h4 className="font-black text-xl text-slate-900">{formatIDR(buckets.posGajiOwner)}</h4>
                  <div className="text-[10px] text-slate-500 space-y-0.5 pt-1 border-t border-slate-100">
                    <div className="flex justify-between">
                      <span>Sudah Ditarik Pribadi:</span>
                      <span className="font-bold text-slate-800">{formatIDR(buckets.totalPenarikanGaji)}</span>
                    </div>
                    <p className="text-blue-800 font-extrabold italic">
                      * Uang hasil usaha murni milik Anda (Bebas Ditarik).
                    </p>
                  </div>
                </div>
              </div>

              {/* Information Note */}
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-[11px] text-emerald-900 space-y-1">
                <span className="font-extrabold flex items-center gap-1 uppercase text-emerald-950">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                  Keunggulan Sistem Kantong Opsi A:
                </span>
                <p className="text-slate-700 leading-relaxed font-medium">
                  Sistem secara otomatis mengisolasi <strong>100% Harga Modal Asli (COGS)</strong> dari setiap transaksi. Dengan alokasi ini, Anda tidak akan pernah mengalami defisit modal re-stock akibat margin barang yang tipis (10-20%).
                </p>
              </div>
            </div>
          )}

          {/* Sub-Tab 2: History Expenses */}
          {activeSubTab === 'history_exp' && (
            <div className="space-y-3">
              <h4 className="font-extrabold text-sm text-slate-900">
                Riwayat Pengeluaran Operasional ({expenses.length})
              </h4>
              {expenses.length === 0 ? (
                <div className="text-center py-10 text-slate-400">
                  Belum ada catatan pengeluaran operasional.
                </div>
              ) : (
                <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs divide-y divide-slate-100">
                  {expenses.map((e) => (
                    <div key={e.id} className="p-3 flex items-center justify-between">
                      <div>
                        <span className="font-bold text-slate-900 block">{e.kategori}</span>
                        <span className="text-[10px] text-slate-500 font-mono">
                          {e.tanggal} {e.keterangan ? `• ${e.keterangan}` : ''}
                        </span>
                      </div>
                      <span className="font-black text-rose-600 text-sm">
                        -{formatIDR(e.nominal)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Sub-Tab 3: History Owner Draws */}
          {activeSubTab === 'history_draw' && (
            <div className="space-y-3">
              <h4 className="font-extrabold text-sm text-slate-900">
                Riwayat Penarikan Gaji Pribadi / Prive ({ownerDraws.length})
              </h4>
              {ownerDraws.length === 0 ? (
                <div className="text-center py-10 text-slate-400">
                  Belum ada catatan penarikan gaji owner.
                </div>
              ) : (
                <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs divide-y divide-slate-100">
                  {ownerDraws.map((d) => (
                    <div key={d.id} className="p-3 flex items-center justify-between">
                      <div>
                        <span className="font-bold text-slate-900 block">Penarikan Keperluan Pribadi</span>
                        <span className="text-[10px] text-slate-500 font-mono">
                          {d.tanggal} {d.catatan ? `• ${d.catatan}` : ''}
                        </span>
                      </div>
                      <span className="font-black text-blue-600 text-sm">
                        -{formatIDR(d.nominal)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
