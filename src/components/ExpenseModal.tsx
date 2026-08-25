'use client';

import React, { useState } from 'react';
import { ExpenseKategori } from '@/types';
import { X, Fuel, PlusCircle, Calendar, DollarSign, FileText } from 'lucide-react';
import confetti from 'canvas-confetti';

interface ExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveExpense: (expenseData: {
    kategori: ExpenseKategori;
    nominal: number;
    keterangan: string;
    tanggal: string;
  }) => Promise<void>;
}

const EXPENSE_CATEGORIES: ExpenseKategori[] = [
  'Bensin / BBM',
  'Makan & Minum Lapangan',
  'Tol, Parkir & Retribusi',
  'Perawatan & Servis Armada',
  'Operasional Lainnya',
];

export const ExpenseModal: React.FC<ExpenseModalProps> = ({
  isOpen,
  onClose,
  onSaveExpense,
}) => {
  const todayStr = new Date().toISOString().split('T')[0];

  const [kategori, setKategori] = useState<ExpenseKategori>('Bensin / BBM');
  const [nominal, setNominal] = useState<number>(20000);
  const [keterangan, setKeterangan] = useState<string>('');
  const [tanggal, setTanggal] = useState<string>(todayStr);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (nominal <= 0) {
      alert('Nominal pengeluaran harus lebih dari Rp 0');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSaveExpense({
        kategori,
        nominal,
        keterangan: keterangan.trim() || kategori,
        tanggal,
      });

      confetti({ particleCount: 50, spread: 40, origin: { y: 0.6 } });
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal menyimpan pengeluaran';
      alert(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl text-slate-900 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3.5 bg-amber-600 text-white shrink-0">
          <div className="flex items-center gap-2">
            <Fuel className="w-5 h-5" />
            <div>
              <h3 className="font-extrabold text-sm leading-tight">Catat Pengeluaran Operasional</h3>
              <p className="text-[10px] text-amber-100 font-medium">Bensin, Makan Lapangan, Tol, & Parkir</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-amber-100 hover:text-white hover:bg-amber-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 space-y-3 text-xs overflow-y-auto max-h-[80vh]">
          {/* Category Pills */}
          <div>
            <label className="block font-extrabold text-slate-700 mb-1.5">Kategori Pengeluaran *</label>
            <div className="grid grid-cols-2 gap-1.5">
              {EXPENSE_CATEGORIES.map((cat) => (
                <button
                  type="button"
                  key={cat}
                  onClick={() => setKategori(cat)}
                  className={`p-2 rounded-xl text-[11px] font-extrabold text-left border transition-all ${
                    kategori === cat
                      ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Nominal & Date */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block font-extrabold text-slate-700 mb-1 flex items-center gap-1">
                <DollarSign className="w-3.5 h-3.5 text-amber-600" />
                Nominal (Rp) *
              </label>
              <input
                type="number"
                min="0"
                step="any"
                value={nominal}
                onChange={(e) => setNominal(Number(e.target.value))}
                className="w-full px-3 py-1.5 bg-white border border-amber-400 rounded-xl text-slate-900 font-black focus:outline-none focus:border-amber-600"
                required
              />
            </div>

            <div>
              <label className="block font-extrabold text-slate-700 mb-1 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-500" />
                Tanggal *
              </label>
              <input
                type="date"
                value={tanggal}
                onChange={(e) => setTanggal(e.target.value)}
                className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-xl font-bold text-slate-900 focus:outline-none"
                required
              />
            </div>
          </div>

          {/* Keterangan / Note */}
          <div>
            <label className="block font-extrabold text-slate-700 mb-1 flex items-center gap-1">
              <FileText className="w-3.5 h-3.5 text-slate-500" />
              Keterangan (Opsional)
            </label>
            <input
              type="text"
              placeholder="Misal: Bensin Pertalite Motor Canvass Pasar Legi"
              value={keterangan}
              onChange={(e) => setKeterangan(e.target.value)}
              className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-slate-900 font-medium"
            />
          </div>

          <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-xl text-[10px] text-slate-600 font-medium italic">
            * Pengeluaran ini otomatis memotong Saldo Pos Operasional Lapangan tanpa merusak modal belanja stok Anda.
          </div>

          {/* Buttons */}
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
              className="flex items-center gap-1.5 px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white font-extrabold rounded-xl shadow-xs active:scale-95 transition-all disabled:opacity-50"
            >
              <PlusCircle className="w-4 h-4" />
              <span>{isSubmitting ? 'Menyimpan...' : 'Simpan Pengeluaran'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
