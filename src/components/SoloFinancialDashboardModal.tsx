'use client';

import React, { useState } from 'react';
import { Order, Purchase, Expense, OwnerDraw, SoloFinancialBuckets } from '@/types';
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
    ownerDraws
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl text-slate-900 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-slate-900 text-white shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center font-black text-white">
              💰
            </div>
            <div>
              <h3 className="font-extrabold text-base leading-tight">Pos Keuangan Solo Distributor (3 Kantong)</h3>
              <p className="text-[11px] text-slate-400 font-medium">
                Pemisahan Otomatis Modal Belanja, Operasional, & Gaji Pribadi Owner
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
              3 Kantong Keuangan
            </button>
            <button
              onClick={() => setActiveSubTab('history_exp')}
              className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all ${
                activeSubTab === 'history_exp'
                  ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Histori Operasional ({expenses.length})
            </button>
            <button
              onClick={() => setActiveSubTab('history_draw')}
              className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all ${
                activeSubTab === 'history_draw'
                  ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Histori Tarik Gaji ({ownerDraws.length})
            </button>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={onOpenExpenseModal}
              className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white font-extrabold rounded-lg text-[11px] flex items-center gap-1 shadow-xs"
            >
              <Fuel className="w-3.5 h-3.5" />
              <span>+ Operasional</span>
            </button>
            <button
              onClick={onOpenPurchaseModal}
              className="px-2.5 py-1 bg-teal-600 hover:bg-teal-700 text-white font-extrabold rounded-lg text-[11px] flex items-center gap-1 shadow-xs"
            >
              <Package className="w-3.5 h-3.5" />
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
              <div className="bg-slate-900 text-white p-4 rounded-2xl shadow-sm flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">
                    Total Kas Masuk (Penjualan Lunas)
                  </span>
                  <h3 className="text-2xl font-black text-white">{formatIDR(buckets.totalOmsetLunas)}</h3>
                  <p className="text-[11px] text-emerald-400 font-medium">
                    Telah dibagi otomatis ke 3 Pos Keuangan Usaha Solo Anda
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
                      1. Modal Belanja Stok
                    </span>
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 font-black px-1.5 py-0.5 rounded">
                      Pos 80%
                    </span>
                  </div>
                  <h4 className="font-black text-xl text-slate-900">{formatIDR(buckets.posModalBelanjaStok)}</h4>
                  <div className="text-[10px] text-slate-500 space-y-0.5 pt-1 border-t border-slate-100">
                    <div className="flex justify-between">
                      <span>Sudah Belanja Restock:</span>
                      <span className="font-bold text-slate-800">{formatIDR(buckets.totalPembelianRestock)}</span>
                    </div>
                    <p className="text-emerald-800 font-extrabold italic">
                      * Uang terkunci khusus beli stok ke supplier.
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
                      Pos 5%
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
                      3. Gaji Pribadi Saya
                    </span>
                    <span className="text-[10px] bg-blue-100 text-blue-800 font-black px-1.5 py-0.5 rounded">
                      Pos 15%
                    </span>
                  </div>
                  <h4 className="font-black text-xl text-slate-900">{formatIDR(buckets.posGajiOwner)}</h4>
                  <div className="text-[10px] text-slate-500 space-y-0.5 pt-1 border-t border-slate-100">
                    <div className="flex justify-between">
                      <span>Sudah Ditarik/Diambil:</span>
                      <span className="font-bold text-slate-800">{formatIDR(buckets.totalPenarikanGaji)}</span>
                    </div>
                    <p className="text-blue-800 font-extrabold italic">
                      * Uang BERSIH yang AMAN dibawa pulang.
                    </p>
                  </div>
                </div>
              </div>

              {/* Information Banner */}
              <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-2xl text-xs space-y-1 text-slate-700">
                <h5 className="font-extrabold text-blue-900 flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4 text-blue-700" />
                  Keunggulan Sistem 3 Kantong untuk Usaha Solo:
                </h5>
                <ul className="list-disc list-inside text-[11px] space-y-0.5 text-slate-600 font-medium">
                  <li>Uang modal belanja stok tidak pernah habis terpakai untuk keperluan rumah tangga.</li>
                  <li>Anda selalu memiliki kepastian berapa gaji bersih yang boleh ditarik setiap minggu.</li>
                  <li>Pengeluaran bensin dan makan di jalan tercatat rapi tanpa mengganggu keuangan usaha.</li>
                </ul>
              </div>
            </div>
          )}

          {/* SubTab 2: History Expenses */}
          {activeSubTab === 'history_exp' && (
            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs space-y-3">
              <h4 className="font-extrabold text-slate-900 text-xs uppercase flex items-center gap-1.5">
                <Fuel className="w-4 h-4 text-amber-600" />
                Histori Pengeluaran Operasional (BBM, Makan, Tol)
              </h4>

              {expenses.length === 0 ? (
                <div className="text-center py-8 text-slate-400 font-bold">
                  Belum ada catatan pengeluaran operasional.
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {expenses.map((e) => (
                    <div key={e.id} className="py-2 flex items-center justify-between text-xs">
                      <div>
                        <div className="font-bold text-slate-900">{e.kategori}</div>
                        <div className="text-[10px] text-slate-500">{e.keterangan || '-'} ({e.tanggal})</div>
                      </div>
                      <span className="font-black text-amber-700">{formatIDR(e.nominal)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* SubTab 3: History Owner Draws */}
          {activeSubTab === 'history_draw' && (
            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs space-y-3">
              <h4 className="font-extrabold text-slate-900 text-xs uppercase flex items-center gap-1.5">
                <Wallet className="w-4 h-4 text-blue-600" />
                Histori Penarikan Gaji / Uang Pribadi Owner
              </h4>

              {ownerDraws.length === 0 ? (
                <div className="text-center py-8 text-slate-400 font-bold">
                  Belum ada catatan penarikan gaji pribadi.
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {ownerDraws.map((d) => (
                    <div key={d.id} className="py-2 flex items-center justify-between text-xs">
                      <div>
                        <div className="font-bold text-slate-900">{d.catatan || 'Tarik Gaji Owner'}</div>
                        <div className="text-[10px] text-slate-500">{d.tanggal}</div>
                      </div>
                      <span className="font-black text-blue-800">{formatIDR(d.nominal)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-white border-t border-slate-200 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-extrabold rounded-xl text-xs shadow-xs"
          >
            Tutup Pos Keuangan
          </button>
        </div>
      </div>
    </div>
  );
};
