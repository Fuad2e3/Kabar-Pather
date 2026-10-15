# 🚀 Edge Deployment Guide — কবর পথের সামগ্রী (Kabar Pather)

This manual provides the complete, authoritative operational instructions for deploying and running **কবর পথের সামগ্রী (Kabar Pather)** on **Edge Pages (with Edge Pages Functions)**, **Edge D1 (SQL Database)**, and **Edge R2 (Photo Storage)**.

---

## 1. Prerequisites Checklist

Before proceeding with deployment, ensure the following are installed and configured:

1. **Node.js**: Version 18.0.0 or higher (`node -v`).
2. **Wrangler CLI**: Developer command line interface (`npm install -g wrangler` or use `npx wrangler`).
3. **Edge Account**: Active account with D1 and R2 enabled.
4. **Authentication**:
   ```bash
   npx wrangler login
   ```
   Verify authentication status:
   ```bash
   npx wrangler whoami
   ```

---

## 2. Step-by-Step Deployment Procedure

### Step 1: Provision the Edge D1 Database

Run the following command in the project root directory:

```bash
npm run db:create
```
*(Or directly: `npx wrangler d1 create kabar-pather-db`)*

Output will display configuration similar to:
```toml
[[d1_databases]]
binding = "DB"
database_name = "kabar-pather-db"
database_id = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
```

👉 **Action Required**: Open [wrangler.toml](file:///c:/Users/fuadk/Documents/GitHub/Kabar-Pather/wrangler.toml) and replace `"REPLACE_WITH_YOUR_D1_DATABASE_ID"` with your newly generated `database_id`.

---

### Step 2: Initialize D1 Database Schema & Seed Data

**1. Create Tables and Indexes:**
```bash
npm run db:init
```
*(Or directly: `npx wrangler d1 execute kabar-pather-db --remote --file=./database/schema.sql`)*

This executes [database/schema.sql](file:///c:/Users/fuadk/Documents/GitHub/Kabar-Pather/database/schema.sql) on D1, provisioning:
- `users` table
- `products` table
- `orders` table
- All performance indexes

**2. Populate Initial Catalog & Default Admin Profile:**
```bash
npm run db:seed
```
*(Or directly: `npx wrangler d1 execute kabar-pather-db --remote --file=./database/seed.sql`)*

This inserts the built-in Islamic funeral packages (কাফন প্যাকেজ পুরুষ, কাফন প্যাকেজ মহিলা, আতর ও সুরমা সেট, সম্পূর্ণ দাফন সামগ্রী কিট) alongside the default administrator profile.

> 💡 **For Local Offline Testing:**
> ```bash
> npx wrangler d1 execute kabar-pather-db --local --file=./database/schema.sql
> npx wrangler d1 execute kabar-pather-db --local --file=./database/seed.sql
> ```

---

### Step 3: Provision the Edge R2 Photo Storage Bucket

Create the R2 storage bucket to house all WebP compressed product photos:

```bash
npm run r2:create
```
*(Or directly: `npx wrangler r2 bucket create kabar-pather-photos`)*

The binding in [wrangler.toml](file:///c:/Users/fuadk/Documents/GitHub/Kabar-Pather/wrangler.toml) is pre-configured as:
```toml
[[r2_buckets]]
binding = "PHOTOS_BUCKET"
bucket_name = "kabar-pather-photos"
```

---

### Step 4: Deploy to Edge Pages

Edge Pages automatically serves your frontend static assets from the root directory and powers all API routes (`/api/*`) via **Edge Pages Functions** located in `functions/api/`:

#### Option A: Direct CLI Deployment
```bash
npm run deploy
```
*(Or directly: `npx wrangler pages deploy . --project-name=kabar-pather`)*

#### Option B: Git-Integrated Dashboard Deployment
1. Log in to your Edge Pages Dashboard.
2. Navigate to **Pages** ➔ **Create a project** ➔ **Connect to Git**.
3. Select your `Kabar-Pather` GitHub repository.
4. Set Build Settings:
   - **Framework preset**: None
   - **Build command**: *(leave blank or `npm run build`)*
   - **Build output directory**: `.`
5. Once created, open **Settings** ➔ **Functions**:
   - Under **D1 database bindings**, add variable name `DB` linked to `kabar-pather-db`.
   - Under **R2 bucket bindings**, add variable name `PHOTOS_BUCKET` linked to `kabar-pather-photos`.

---

## 3. Post-Deployment Verification

Verify operational health by requesting the edge ping endpoint:
```bash
curl -X GET https://<your-project>.pages.dev/api/ping
```
Expected response:
```json
{
  "ok": true,
  "message": "Kabar Pather Edge API is running.",
  "databaseConnected": true,
  "r2Connected": true
}
```

---

## 4. Default System Credentials

- **Admin Portal**: `/admin.html`
- **Admin Email**: `admin@kabarpather.com`
- **Admin Password**: `admin123`
- **Customer Helpline**: `01844-687759`
- **Physical Address**: কামরাঙ্গীরচর, ঢাকা - ১২১১

---

## 5. Troubleshooting & Diagnostics

| Symptom | Cause | Solution |
| :--- | :--- | :--- |
| `D1 binding (env.DB) is missing` | Missing `database_id` in `wrangler.toml` or dashboard | Ensure `DB` binding is set in `wrangler.toml` and Pages settings. |
| `R2 bucket not found` | Bucket name mismatch | Run `npx wrangler r2 bucket create kabar-pather-photos`. |
| `Image upload fallback` | `PHOTOS_BUCKET` binding missing | Ensure `binding = "PHOTOS_BUCKET"` matches in `wrangler.toml`. |
| `Photo optimization not triggering` | Browser does not support HTML5 Canvas WebP export | `PhotoOptimizer` automatically falls back to standard image payload gracefully. |
