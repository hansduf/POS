'use client';

import React, { useState, useEffect } from 'react';
import { StoreSettings } from '@/types';
import { X, Settings, Store, MapPin, Phone, CreditCard, FileText, CheckCircle2, User } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: StoreSettings;
  onSaveSettings: (newSettings: StoreSettings) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSaveSettings,
}) => {
  const [formData, setFormData] = useState<StoreSettings>(settings);

  useEffect(() => {
    setFormData(settings);
  }, [settings, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSettings(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl text-slate-900 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-200 bg-slate-50 shrink-0">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-emerald-100 text-emerald-800">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-slate-900">Pengaturan Usaha & Profil Faktur</h3>
              <p className="text-[11px] font-medium text-slate-500">Ubah identitas usaha & rekening cetak nota</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200/60"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-3.5 text-xs overflow-y-auto flex-1">
          <div>
            <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1">
              <Store className="w-3.5 h-3.5 text-emerald-600" />
              Nama Usaha / Distributor <span className="text-rose-600">*</span>
            </label>
            <input
              type="text"
              value={formData.nama_usaha}
              onChange={(e) => setFormData({ ...formData, nama_usaha: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900 focus:outline-none focus:border-emerald-600"
              required
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-emerald-600" />
              Alamat Usaha / Gudang
            </label>
            <input
              type="text"
              value={formData.alamat_usaha}
              onChange={(e) => setFormData({ ...formData, alamat_usaha: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-semibold text-slate-900 focus:outline-none focus:border-emerald-600"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-emerald-600" />
                No. Telepon / WA
              </label>
              <input
                type="text"
                value={formData.no_telp}
                onChange={(e) => setFormData({ ...formData, no_telp: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-semibold text-slate-900 focus:outline-none focus:border-emerald-600"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-emerald-600" />
                Nama Salesman / Owner
              </label>
              <input
                type="text"
                value={formData.nama_pemilik}
                onChange={(e) => setFormData({ ...formData, nama_pemilik: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-semibold text-slate-900 focus:outline-none focus:border-emerald-600"
              />
            </div>
          </div>

          {/* Bank Account Info */}
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2">
            <h4 className="font-extrabold text-slate-800 flex items-center gap-1">
              <CreditCard className="w-3.5 h-3.5 text-emerald-600" />
              Info Rekening Pembayaran Transfer
            </h4>

            <div>
              <label className="block text-[10px] font-semibold text-slate-600 mb-0.5">Nama Bank</label>
              <input
                type="text"
                placeholder="BANK BCA / MANDIRI"
                value={formData.bank_name}
                onChange={(e) => setFormData({ ...formData, bank_name: e.target.value })}
                className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg font-bold text-slate-900"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] font-semibold text-slate-600 mb-0.5">No. Rekening</label>
                <input
                  type="text"
                  placeholder="164-800-3321"
                  value={formData.bank_account}
                  onChange={(e) => setFormData({ ...formData, bank_account: e.target.value })}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg font-mono font-bold text-slate-900"
                />
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-slate-600 mb-0.5">Atas Nama (A/N)</label>
                <input
                  type="text"
                  placeholder="UD. Barokah Jaya"
                  value={formData.bank_an}
                  onChange={(e) => setFormData({ ...formData, bank_an: e.target.value })}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg font-bold text-slate-900"
                />
              </div>
            </div>
          </div>

          {/* Disclaimer Bawah Nota */}
          <div>
            <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1">
              <FileText className="w-3.5 h-3.5 text-slate-500" />
              Catatan Disclaimer Bawah Faktur
            </label>
            <textarea
              value={formData.catatan_faktur}
              onChange={(e) => setFormData({ ...formData, catatan_faktur: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-medium resize-none h-16"
            />
          </div>

          {/* Reset Cache Section */}
          <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
            <div>
              <p className="font-extrabold text-slate-800 text-[11px]">Bersihkan Cache Offline Browser</p>
              <p className="text-[10px] text-slate-500">Gunakan ini jika Anda habis menghapus/reset tabel di Supabase DB.</p>
            </div>
            <button
              type="button"
              onClick={() => {
                if (confirm('Bersihkan seluruh cache offline browser dan muat ulang dari Supabase DB?')) {
                  localStorage.clear();
                  window.location.reload();
                }
              }}
              className="px-3 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-[10px] font-extrabold"
            >
              Reset Cache
            </button>
          </div>

          {/* Action Footer */}
          <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-200 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-600 font-bold hover:text-slate-900"
            >
              Batal
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl shadow-md active:scale-95 transition-all"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Simpan Pengaturan</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
