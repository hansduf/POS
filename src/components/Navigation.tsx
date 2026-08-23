'use client';

import React from 'react';
import { ShoppingBag, Truck, Package, Store, LayoutDashboard, Settings } from 'lucide-react';

import { StoreSettings } from '@/types';
import { DEFAULT_SETTINGS } from '@/lib/store';

export type TabType = 'order' | 'pengiriman' | 'stok' | 'toko' | 'dashboard';

interface NavigationProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  cartCount: number;
  deliveryCount?: number;
  openCart: () => void;
  onOpenSettings?: () => void;
  settings?: StoreSettings;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  setActiveTab,
  cartCount,
  deliveryCount = 0,
  openCart,
  onOpenSettings,
  settings = DEFAULT_SETTINGS,
}) => {
  const storeName = settings.nama_usaha || 'DISTRIBUTOR JOSJIS';
  const initialLetter = storeName.charAt(0).toUpperCase() || 'S';

  const navItems = [
    { id: 'order' as TabType, label: 'Order Sales', icon: ShoppingBag, badge: cartCount > 0 ? cartCount : null },
    { id: 'pengiriman' as TabType, label: 'Pengiriman', icon: Truck, badge: deliveryCount > 0 ? deliveryCount : null },
    { id: 'stok' as TabType, label: 'Stok', icon: Package },
    { id: 'toko' as TabType, label: 'Toko', icon: Store },
    { id: 'dashboard' as TabType, label: 'Dashboard', icon: LayoutDashboard },
  ];

  return (
    <>
      {/* Desktop Top Navbar (High Contrast Light Mode) */}
      <header className="hidden md:flex items-center justify-between px-6 py-3.5 bg-white border-b border-slate-200 text-slate-900 sticky top-0 z-40 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center shadow-sm text-white font-black text-lg">
            {initialLetter}
          </div>
          <div>
            <h1 className="font-extrabold text-base leading-tight text-slate-900">
              {storeName}
            </h1>
            <p className="text-[11px] text-slate-500 font-medium">Sistem Penjualan & Pengiriman Lapangan</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <nav className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all relative ${
                    isActive
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                  {item.badge !== null && (
                    <span className="ml-1 px-1.5 py-0.2 text-[10px] font-extrabold bg-amber-400 text-slate-950 rounded-full">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {onOpenSettings && (
            <button
              onClick={onOpenSettings}
              className="p-2 text-slate-600 hover:text-emerald-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-xl transition-colors"
              title="Pengaturan Profil Usaha & Nota"
            >
              <Settings className="w-4 h-4" />
            </button>
          )}
        </div>
      </header>

      {/* Mobile Top Header Banner */}
      <div className="md:hidden flex items-center justify-between px-4 py-2.5 bg-white text-slate-900 border-b border-slate-200 sticky top-0 z-30 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white font-black flex items-center justify-center text-sm">
            {initialLetter}
          </div>
          <div>
            <h2 className="font-extrabold text-xs text-slate-900 leading-tight">{storeName}</h2>
            <p className="text-[10px] text-slate-500 font-medium">Pasar Lapangan</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {activeTab === 'order' && (
            <button
              onClick={openCart}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg shadow-sm transition-all active:scale-95 ${
                cartCount > 0
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-100 text-slate-700 border border-slate-300'
              }`}
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Keranjang ({cartCount})</span>
            </button>
          )}

          {onOpenSettings && (
            <button
              onClick={onOpenSettings}
              className="p-1.5 text-slate-600 hover:text-emerald-700 bg-slate-100 rounded-lg border border-slate-200"
              title="Pengaturan Usaha"
            >
              <Settings className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-200 px-1 py-1.5 flex items-center justify-around shadow-lg">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center justify-center py-1 px-2 rounded-lg transition-all relative ${
                isActive
                  ? 'text-emerald-700 font-extrabold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 ${isActive ? 'scale-110 text-emerald-700' : ''}`} />
                {item.badge !== null && (
                  <span className="absolute -top-1.5 -right-2.5 px-1.5 py-0.2 text-[9px] font-black bg-amber-400 text-slate-950 rounded-full">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] mt-0.5 tracking-tight">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </>
  );
};
