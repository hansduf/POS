'use client';

import React, { useState } from 'react';
import { X, Wallet, ArrowDownRight, Calendar, FileText } from 'lucide-react';
import confetti from 'canvas-confetti';

interface OwnerDrawModalProps {
  isOpen: boolean;
  onClose: () => void;
  maxAvailableSalary: number;
  onSaveOwnerDraw: (drawData: {
    nominal: number;
    catatan: string;
    tanggal: string;
  }) => Promise<void>;
}

export const OwnerDrawModal: React.FC<OwnerDrawModalProps> = ({
  isOpen,
  onClose,
  maxAvailableSalary,
  onSaveOwnerDraw,
}) => {
  const todayStr = new Date().toISOString().split('T')[0];

  const [nominal, setNominal] = useState<number>(100000);
  const [catatan, setCatatan] = useState<string>('Tarik Uang Pribadi / Gaji Owner');
  const [tanggal, setTanggal] = useState<string>(todayStr);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const formatIDR = (val: number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(
      val
    );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (nominal <= 0) {
      alert('Nominal penarikan harus lebih dari Rp 0');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSaveOwnerDraw({
        nominal,
        catatan: catatan.trim() || 'Tarik Gaji Owner',
        tanggal,
      });

      confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal menyimpan penarikan gaji';
      alert(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl text-slate-900 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3.5 bg-blue-700 text-white shrink-0">
          <div className="flex items-center gap-2">
            <Wallet className="w-5 h-5" />
            <div>
              <h3 className="font-extrabold text-sm leading-tight">Tarik Gaji / Uang Pribadi Owner</h3>
              <p className="text-[10px] text-blue-100 font-medium">Catat Penarikan Uang Pribadi dari Kas Usaha</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-blue-100 hover:text-white hover:bg-blue-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 space-y-3 text-xs overflow-y-auto max-h-[80vh]">
          {/* Max Salary Box */}
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl space-y-0.5">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-slate-700">Saldo Pos Gaji Pribadi Siap Diambil:</span>
              <span className="font-black text-blue-800 text-sm">{formatIDR(maxAvailableSalary)}</span>
            </div>
            <p className="text-[10px] text-slate-500 italic">
              * Diambil aman tanpa mengurangi uang modal belanja stok supplier.
            </p>
          </div>

          {/* Nominal & Date */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block font-extrabold text-slate-700 mb-1">Nominal Tarik (Rp) *</label>
              <input
                type="text"
                value={nominal > 0 ? nominal.toLocaleString('id-ID') : ''}
                onChange={(e) => {
                  const clean = e.target.value.replace(/\D/g, '');
                  setNominal(clean ? parseInt(clean, 10) : 0);
                }}
                placeholder="0"
                className="w-full px-3 py-1.5 bg-white border border-blue-400 rounded-xl text-slate-900 font-black focus:outline-none focus:border-blue-600"
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

          {/* Catatan */}
          <div>
            <label className="block font-extrabold text-slate-700 mb-1 flex items-center gap-1">
              <FileText className="w-3.5 h-3.5 text-slate-500" />
              Catatan Penarikan
            </label>
            <input
              type="text"
              placeholder="Keperluan belanja pribadi / dapur rumah"
              value={catatan}
              onChange={(e) => setCatatan(e.target.value)}
              className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-slate-900 font-medium"
            />
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
              className="flex items-center gap-1.5 px-5 py-2 bg-blue-700 hover:bg-blue-800 text-white font-extrabold rounded-xl shadow-xs active:scale-95 transition-all disabled:opacity-50"
            >
              <ArrowDownRight className="w-4 h-4" />
              <span>{isSubmitting ? 'Menyimpan...' : 'Tarik Uang Pribadi'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
