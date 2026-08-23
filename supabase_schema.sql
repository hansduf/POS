-- =============================================================================
-- SUPABASE DATABASE SCHEMA & STORED PROCEDURES (RPC)
-- Aplikasi Penjualan Canvasser Pasar & Logistik Pengiriman Lapangan
-- =============================================================================
-- Salin dan Jalankan Seluruh Script ini di Supabase SQL Editor untuk
-- menginisialisasi 6 Tabel, RLS Policies, dan 3 Stored Procedure RPC.
-- =============================================================================

-- 1. TABEL TOKOS (Pelanggan Pasar)
CREATE TABLE IF NOT EXISTS public.tokos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nama_toko VARCHAR(255) NOT NULL,
    lokasi_pasar VARCHAR(255) NOT NULL,
    nama_pemilik VARCHAR(255) NOT NULL,
    no_hp VARCHAR(50) NOT NULL,
    lokasi_rumah TEXT,
    catatan TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. TABEL PRODUCTS (Stok & 3-Tier Harga)
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nama_produk VARCHAR(255) NOT NULL,
    kode_sku VARCHAR(100) UNIQUE,
    satuan VARCHAR(50) NOT NULL DEFAULT 'Pcs',
    harga_modal DECIMAL(12, 2) NOT NULL DEFAULT 0,
    harga_normal DECIMAL(12, 2) NOT NULL DEFAULT 0,
    harga_minimum DECIMAL(12, 2) NOT NULL DEFAULT 0,
    stok INT NOT NULL DEFAULT 0,
    category VARCHAR(100) DEFAULT 'Umum',
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. TABEL ORDERS (Header Penjualan & Pengiriman)
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    no_nota VARCHAR(100) NOT NULL UNIQUE,
    toko_id UUID NOT NULL REFERENCES public.tokos(id) ON DELETE CASCADE,
    total_bayar DECIMAL(12, 2) NOT NULL DEFAULT 0,
    jenis_pembayaran VARCHAR(50) NOT NULL DEFAULT 'Cash (Lunas Depan)',
    status_pembayaran VARCHAR(50) NOT NULL DEFAULT 'Belum Lunas',
    tanggal_pengiriman DATE NOT NULL DEFAULT CURRENT_DATE,
    status_pengiriman VARCHAR(50) NOT NULL DEFAULT 'Disiapkan',
    catatan_pengiriman TEXT,
    penerima_nama VARCHAR(100),
    tanggal_diterima TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. TABEL ORDER_ITEMS (Rincian Item Nota)
CREATE TABLE IF NOT EXISTS public.order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    jumlah INT NOT NULL DEFAULT 1,
    harga_deal DECIMAL(12, 2) NOT NULL DEFAULT 0,
    subtotal DECIMAL(12, 2) NOT NULL DEFAULT 0
);

-- 5. TABEL ORDER_LOGS (Audit Trail Perubahan Nota)
CREATE TABLE IF NOT EXISTS public.order_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    catatan_perubahan TEXT NOT NULL,
    perubahan_by VARCHAR(100) DEFAULT 'Sales Canvass',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. TABEL STORE_SETTINGS (Profil Usaha & Rekening Cetak Nota)
CREATE TABLE IF NOT EXISTS public.store_settings (
    id VARCHAR(50) PRIMARY KEY DEFAULT 'default',
    nama_usaha VARCHAR(255) NOT NULL DEFAULT 'DISTRIBUTOR CANVASSING PASAR',
    alamat_usaha TEXT,
    no_telp VARCHAR(50),
    nama_pemilik VARCHAR(150),
    bank_name VARCHAR(150),
    bank_account VARCHAR(100),
    bank_an VARCHAR(150),
    catatan_faktur TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- =============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =============================================================================
ALTER TABLE public.tokos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow all access to tokos" ON public.tokos;
DROP POLICY IF EXISTS "Allow all access to products" ON public.products;
DROP POLICY IF EXISTS "Allow all access to orders" ON public.orders;
DROP POLICY IF EXISTS "Allow all access to order_items" ON public.order_items;
DROP POLICY IF EXISTS "Allow all access to order_logs" ON public.order_logs;
DROP POLICY IF EXISTS "Allow anonymous full access settings" ON public.store_settings;

CREATE POLICY "Allow all access to tokos" ON public.tokos FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to products" ON public.products FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to orders" ON public.orders FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to order_items" ON public.order_items FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to order_logs" ON public.order_logs FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow anonymous full access settings" ON public.store_settings FOR ALL USING (true) WITH CHECK (true);

-- =============================================================================
-- STORED PROCEDURES (RPC) UNTUK TRANSAKSI ATOMIC HIGHT PERFORMANCE
-- =============================================================================

-- RPC 1: Create Order Atomic (Order + Items + Auto Decrement Stock + Log)
CREATE OR REPLACE FUNCTION public.create_order_rpc(
    p_no_nota VARCHAR,
    p_toko_id UUID,
    p_total_bayar DECIMAL,
    p_jenis_pembayaran VARCHAR,
    p_status_pembayaran VARCHAR,
    p_tanggal_pengiriman DATE,
    p_status_pengiriman VARCHAR,
    p_catatan_pengiriman TEXT,
    p_items JSONB
) RETURNS UUID AS $$
DECLARE
    v_order_id UUID;
    item_record JSONB;
BEGIN
    -- 1. Insert order header
    INSERT INTO public.orders (
        no_nota, toko_id, total_bayar, jenis_pembayaran,
        status_pembayaran, tanggal_pengiriman, status_pengiriman, catatan_pengiriman
    ) VALUES (
        p_no_nota, p_toko_id, p_total_bayar, p_jenis_pembayaran,
        p_status_pembayaran, p_tanggal_pengiriman, p_status_pengiriman, p_catatan_pengiriman
    ) RETURNING id INTO v_order_id;

    -- 2. Insert order items & update product stock
    FOR item_record IN SELECT * FROM jsonb_array_elements(p_items)
    LOOP
        INSERT INTO public.order_items (
            order_id, product_id, jumlah, harga_deal, subtotal
        ) VALUES (
            v_order_id,
            (item_record->>'product_id')::UUID,
            (item_record->>'jumlah')::INT,
            (item_record->>'harga_deal')::DECIMAL,
            (item_record->>'subtotal')::DECIMAL
        );

        -- Deduct stock
        UPDATE public.products
        SET stok = GREATEST(0, stok - (item_record->>'jumlah')::INT),
            updated_at = NOW()
        WHERE id = (item_record->>'product_id')::UUID;
    END LOOP;

    -- 3. Create initial Audit Log
    INSERT INTO public.order_logs (order_id, catatan_perubahan)
    VALUES (v_order_id, 'Nota ' || p_no_nota || ' berhasil dibuat (' || p_jenis_pembayaran || ')');

    RETURN v_order_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RPC 2: Confirm Delivery Atomic (Update Status, Lunas & Log Penerima)
CREATE OR REPLACE FUNCTION public.confirm_delivery_rpc(
    p_order_id UUID,
    p_penerima_nama VARCHAR,
    p_catatan TEXT
) RETURNS BOOLEAN AS $$
BEGIN
    UPDATE public.orders
    SET status_pengiriman = 'Terkirim',
        status_pembayaran = 'Lunas',
        penerima_nama = p_penerima_nama,
        tanggal_diterima = NOW()
    WHERE id = p_order_id;

    INSERT INTO public.order_logs (order_id, catatan_perubahan)
    VALUES (
        p_order_id,
        'Pengiriman Dikonfirmasi & Terkirim (Penerima: ' || p_penerima_nama || COALESCE(', Catatan: ' || p_catatan, '') || ')'
    );

    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RPC 3: Update Order Atomic (Header, Items, Audit Log)
CREATE OR REPLACE FUNCTION public.update_order_rpc(
    p_order_id UUID,
    p_total_bayar DECIMAL,
    p_jenis_pembayaran VARCHAR,
    p_status_pembayaran VARCHAR,
    p_status_pengiriman VARCHAR,
    p_tanggal_pengiriman DATE,
    p_catatan_pengiriman TEXT,
    p_items JSONB,
    p_log_message TEXT
) RETURNS BOOLEAN AS $$
DECLARE
    item_record JSONB;
BEGIN
    -- 1. Update Order Header
    UPDATE public.orders
    SET total_bayar = COALESCE(p_total_bayar, total_bayar),
        jenis_pembayaran = COALESCE(p_jenis_pembayaran, jenis_pembayaran),
        status_pembayaran = COALESCE(p_status_pembayaran, status_pembayaran),
        status_pengiriman = COALESCE(p_status_pengiriman, status_pengiriman),
        tanggal_pengiriman = COALESCE(p_tanggal_pengiriman, tanggal_pengiriman),
        catatan_pengiriman = COALESCE(p_catatan_pengiriman, catatan_pengiriman)
    WHERE id = p_order_id;

    -- 2. Update items if provided
    IF p_items IS NOT NULL AND jsonb_array_length(p_items) > 0 THEN
        DELETE FROM public.order_items WHERE order_id = p_order_id;

        FOR item_record IN SELECT * FROM jsonb_array_elements(p_items)
        LOOP
            INSERT INTO public.order_items (
                order_id, product_id, jumlah, harga_deal, subtotal
            ) VALUES (
                p_order_id,
                (item_record->>'product_id')::UUID,
                (item_record->>'jumlah')::INT,
                (item_record->>'harga_deal')::DECIMAL,
                (item_record->>'subtotal')::DECIMAL
            );
        END LOOP;
    END IF;

    -- 3. Audit Log
    INSERT INTO public.order_logs (order_id, catatan_perubahan)
    VALUES (p_order_id, p_log_message);

    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================================================
-- DATA INITIAL / SEED SAMPLE DATA
-- =============================================================================

-- Seed Default Settings
INSERT INTO public.store_settings (id, nama_usaha, alamat_usaha, no_telp, nama_pemilik, bank_name, bank_account, bank_an, catatan_faktur)
VALUES (
    'default',
    'DISTRIBUTOR josjis',
    'Jl. Sidorejo 7, Gupolo, Kec. Babadan, Kabupaten Ponorogo, Jawa Timur 63491',
    '08993179345',
    'Farhan',
    'BANK BCA / BANK MANDIRI',
    'belum tersedia',
    'DISTRIBUTOR CANVASS PASAR',
    'PEMBAYARAN DENGAN CHEQUE / BG / TRANSFER DIANGGAP LUNAS, APABILA SUDAH DAPAT DIUANGKAN / REKENING KAMI TERCATAT LUNAS.'
) ON CONFLICT (id) DO NOTHING;

-- Seed Sample Products
INSERT INTO public.products (nama_produk, kode_sku, satuan, harga_modal, harga_normal, harga_minimum, stok, category) VALUES
('Minyak Goreng Kita 1L', 'MGK-1L', 'Dus (12 Pcs)', 160000, 185000, 172000, 50, 'Minyak & Lemak')

ON CONFLICT (kode_sku) DO NOTHING;

-- Seed Sample Tokos
INSERT INTO public.tokos (nama_toko, lokasi_pasar, nama_pemilik, no_hp, lokasi_rumah, catatan) VALUES
('Toko Berkah Jaya', 'Pasar Senen Block C-12', 'H. Ahmad', '081234567890', 'Jl. Kramat Pulo No. 45', 'Suka belanja minyak & gula')
