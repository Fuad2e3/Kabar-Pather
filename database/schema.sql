-- ============================================================================
-- কবর পথের সামগ্রী — Edge D1 Database Schema
-- ============================================================================

-- 1. Users Table (Customer Accounts & Admin)
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  registered_at TEXT NOT NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  password TEXT NOT NULL,
  status TEXT DEFAULT 'Active', -- 'Active' | 'Inactive' | 'Suspended'
  role TEXT DEFAULT 'Customer'   -- 'Customer' | 'Admin'
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);
CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);

-- 2. Products Table (Kafan, Dafon, Janaza, Attar & Kits)
CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  created_at TEXT NOT NULL,
  title TEXT NOT NULL,
  category TEXT NOT NULL,        -- 'kafan' | 'dafon' | 'janaza' | 'attar' | 'package' | 'other'
  price REAL NOT NULL,
  old_price REAL DEFAULT 0,
  unit TEXT DEFAULT 'সেট',       -- 'সেট' | 'পিস' | 'প্যাকেজ' | 'বোতল'
  badge TEXT DEFAULT '',         -- 'প্রিমিয়াম কোয়ালিটি' | 'পূর্ণাঙ্গ সেট' | 'হট ডিল'
  stock INTEGER DEFAULT 10,
  short_desc TEXT,
  description TEXT,
  items_included TEXT DEFAULT '[]', -- JSON array of items included in package
  status TEXT DEFAULT 'Active',  -- 'Active' | 'Inactive'
  images TEXT DEFAULT '[]',      -- JSON array of photo URLs
  rating REAL DEFAULT 5.0,
  reviews INTEGER DEFAULT 0,
  views INTEGER DEFAULT 0,
  tags TEXT DEFAULT '[]'
);

CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);
CREATE INDEX IF NOT EXISTS idx_products_price ON products(price);

-- 3. Orders Table (Customer Orders & Fulfillment)
CREATE TABLE IF NOT EXISTS orders (
  ref TEXT PRIMARY KEY,
  placed_at TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  customer_email TEXT,
  customer_phone TEXT NOT NULL,
  address TEXT NOT NULL,
  area TEXT,                     -- 'ঢাকা সিটি' | 'ঢাকার বাইরে' | etc.
  delivery_type TEXT DEFAULT 'জরুরি ডেলিভারি (২৪ ঘণ্টা)',
  delivery_fee REAL DEFAULT 80,
  payment_method TEXT DEFAULT 'ক্যাশ অন ডেলিভারি',
  items_count INTEGER DEFAULT 1,
  subtotal REAL NOT NULL,
  total_amount REAL NOT NULL,
  items_details TEXT DEFAULT '[]', -- JSON array of [{ id, title, price, qty, image }]
  order_notes TEXT,
  order_status TEXT DEFAULT 'Pending' -- 'Pending' | 'Confirmed' | 'Delivered' | 'Cancelled'
);

CREATE INDEX IF NOT EXISTS idx_orders_placed_at ON orders(placed_at);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(order_status);
CREATE INDEX IF NOT EXISTS idx_orders_phone ON orders(customer_phone);
