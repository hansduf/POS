'use client';

import React, { useState, useEffect } from 'react';
import { X, Store, MapPin, User, Phone, Home, FileText, CheckCircle2 } from 'lucide-react';
import { Toko } from '@/types';

interface TokoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (tokoData: Omit<Toko, 'id' | 'created_at'>, editingId?: string) => Promise<void>;
  existingMarkets: string[];
  editingToko?: Toko | null;
}

export const TokoModal: React.FC<TokoModalProps> = ({
  isOpen,
  onClose,
  onSave,
  existingMarkets,
  editingToko,
}) => {
  const [namaToko, setNamaToko] = useState('');
  const [lokasiPasar, setLokasiPasar] = useState('');
  const [customPasar, setCustomPasar] = useState('');
  const [namaPemilik, setNamaPemilik] = useState('');
  const [noHp, setNoHp] = useState('');
  const [lokasiRumah, setLokasiRumah] = useState('');
  const [catatan, setCatatan] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (editingToko) {
      setNamaToko(editingToko.nama_toko);
      setLokasiPasar(existingMarkets.includes(editingToko.lokasi_pasar) ? editingToko.lokasi_pasar : 'BARU');
      if (!existingMarkets.includes(editingToko.lokasi_pasar)) {
        setCustomPasar(editingToko.lokasi_pasar);
      }
      setNamaPemilik(editingToko.nama_pemilik);
      setNoHp(editingToko.no_hp);
      setLokasiRumah(editingToko.lokasi_rumah || '');
      setCatatan(editingToko.catatan || '');
    } else {
      setNamaToko('');
      setLokasiPasar('');
      setCustomPasar('');
      setNamaPemilik('');
      setNoHp('');
      setLokasiRumah('');
      setCatatan('');
    }
    setErrorMsg('');
  }, [editingToko, isOpen, existingMarkets]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalPasar = lokasiPasar === 'BARU' ? customPasar.trim() : lokasiPasar.trim();

    if (!namaToko.trim() || !finalPasar || !namaPemilik.trim() || !noHp.trim()) {
      setErrorMsg('Mohon lengkapi Nama Toko, Pasar, Pemilik, dan No HP!');
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMsg('');
      await onSave(
        {
          nama_toko: namaToko.trim(),
          lokasi_pasar: finalPasar,
          nama_pemilik: namaPemilik.trim(),
          no_hp: noHp.trim(),
          lokasi_rumah: lokasiRumah.trim() || undefined,
          catatan: catatan.trim() || undefined,
        },
        editingToko?.id
      );

      setNamaToko('');
      setLokasiPasar('');
      setCustomPasar('');
      setNamaPemilik('');
      setNoHp('');
      setLokasiRumah('');
      setCatatan('');
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal menyimpan data toko.';
      setErrorMsg(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl text-slate-900">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-emerald-100 text-emerald-700">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-slate-900">
                {editingToko ? 'Edit Data Toko' : 'Registrasi Toko Baru'}
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                {editingToko ? 'Perbarui informasi toko pelanggan' : 'Daftarkan toko pasar baru'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-3.5 max-h-[80vh] overflow-y-auto">
          {errorMsg && (
            <div className="p-3 text-xs bg-rose-50 border border-rose-200 text-rose-800 rounded-xl font-bold">
              {errorMsg}
            </div>
          )}

          {/* Nama Toko */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
              <Store className="w-3.5 h-3.5 text-emerald-600" />
              Nama Toko <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              placeholder="Contoh: Toko Barokah 88"
              value={namaToko}
              onChange={(e) => setNamaToko(e.target.value)}
              className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-xl text-sm font-bold text-slate-900 focus:outline-none focus:border-emerald-600"
              required
            />
          </div>

          {/* Lokasi Pasar */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-emerald-600" />
              Lokasi Pasar <span className="text-rose-500">*</span>
            </label>
            <select
              value={lokasiPasar}
              onChange={(e) => setLokasiPasar(e.target.value)}
              className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-xl text-sm font-bold text-slate-900 focus:outline-none focus:border-emerald-600 mb-2"
              required
            >
              <option value="">-- Pilih Lokasi Pasar --</option>
              {existingMarkets.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
              <option value="BARU">+ Tambah Nama Pasar Baru</option>
            </select>

            {lokasiPasar === 'BARU' && (
              <input
                type="text"
                placeholder="Ketikkan Nama Pasar Baru"
                value={customPasar}
                onChange={(e) => setCustomPasar(e.target.value)}
                className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-emerald-600"
                required
              />
            )}
          </div>

          {/* Nama Pemilik & No HP */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-emerald-600" />
                Nama Pemilik <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                placeholder="misal: Pak H. Ahmad"
                value={namaPemilik}
                onChange={(e) => setNamaPemilik(e.target.value)}
                className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-emerald-600"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-emerald-600" />
                No. HP / WA <span className="text-rose-500">*</span>
              </label>
              <input
                type="tel"
                placeholder="0812xxxxxxxx"
                value={noHp}
                onChange={(e) => setNoHp(e.target.value)}
                className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-emerald-600"
                required
              />
            </div>
          </div>

          {/* Lokasi Rumah (Opsional) */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
              <Home className="w-3.5 h-3.5 text-slate-500" />
              Alamat Rumah <span className="text-slate-400 font-normal">(Opsional)</span>
            </label>
            <input
              type="text"
              placeholder="Jl. Kramat Pulo No. 45"
              value={lokasiRumah}
              onChange={(e) => setLokasiRumah(e.target.value)}
              className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-emerald-600"
            />
          </div>

          {/* Catatan Kebutuhan */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
              <FileText className="w-3.5 h-3.5 text-slate-500" />
              Catatan Toko <span className="text-slate-400 font-normal">(Opsional)</span>
            </label>
            <textarea
              placeholder="Suka belanja minyak goreng, kirim pagi hari..."
              value={catatan}
              onChange={(e) => setCatatan(e.target.value)}
              className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-emerald-600 resize-none h-16"
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 rounded-xl transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-1.5 px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-md transition-all active:scale-95 disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isSubmitting ? 'Simpan...' : editingToko ? 'Simpan Perubahan Toko' : 'Simpan Toko'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
