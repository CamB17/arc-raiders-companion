# Supabase Setup Guide

This guide will help you set up Supabase for the Arc Raiders Companion app to store custom data.

## 📋 Prerequisites

- Node.js and npm installed
- Arc Raiders Companion project cloned
- A Supabase account (free tier is fine)

## 🚀 Step-by-Step Setup

### 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Sign up or log in
3. Click **"New Project"**
4. Fill in project details:
   - **Name**: `arc-raiders-companion` (or your preference)
   - **Database Password**: Choose a strong password (save it securely!)
   - **Region**: Select closest to your users
   - **Pricing Plan**: Free tier works great
5. Click **"Create new project"** and wait 1-2 minutes for setup

### 2. Get Your Credentials

1. In your Supabase project dashboard, click **Settings** (gear icon)
2. Navigate to **API** section
3. Find and copy these two values:
   - **Project URL**: `https://xxxxxxxxxxxxx.supabase.co`
   - **anon public key**: Long JWT token starting with `eyJ...`

### 3. Set Up Environment Variables

1. In your project root (where `package.json` is), create a `.env` file:

```bash
touch .env
```

2. Add your credentials to `.env`:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key-here
```

⚠️ **Important**: Replace the values with your actual credentials from step 2!

### 4. Create Database Tables

1. In your Supabase dashboard, click the **SQL Editor** icon (left sidebar)
2. Click **"New Query"**
3. Open the `SUPABASE_SCHEMA.md` file in this project
4. Copy the entire SQL schema
5. Paste it into the Supabase SQL editor
6. Click **"Run"** (or press Cmd/Ctrl + Enter)
7. You should see a success message

✅ This creates all the tables, indexes, and security policies needed!

### 5. Verify Tables Were Created

1. Click the **Table Editor** icon in the sidebar
2. You should see 6 new tables:
   - `custom_items`
   - `custom_quests`
   - `custom_traders`
   - `custom_locations`
   - `custom_guides`
   - `custom_builds`

### 6. Start the Development Server

```bash
npm run dev
```

### 7. Test the Admin Panel

1. Open your browser to `http://localhost:5173/admin`
2. You should see:
   - ✅ "Supabase Connected" indicator
   - Dashboard with stats
   - Admin sections for managing data

If you see setup instructions instead, check your `.env` file!

## 📚 What Can You Do Now?

### Add Custom Item Data

1. Go to `/admin/items`
2. Click **"Add Custom Item"**
3. Fill in the form:
   - **Item ID**: The ID from the Arc Raiders API (e.g., `herbal-bandage`)
   - **Tips**: Helpful usage tips
   - **Locations Found**: Where to find this item
   - **Meta Rating**: Community rating 1-5
   - **Tags**: Custom tags for filtering

### View on Frontend

Custom data automatically merges with API data on the frontend:
- Visit `/items/herbal-bandage` (if you added custom data for it)
- You'll see your custom tips, ratings, and locations displayed!

## 🔒 Security Setup

### Current Setup: Public Access

By default, the database allows anyone to read and write data. This is great for:
- Development and testing
- Community-driven wikis
- Internal tools

### Production: Add Authentication (Recommended)

For production, add Supabase authentication:

1. Enable auth providers in Supabase → Authentication → Providers
2. Update RLS policies to require authentication:

```sql
-- Example: Only authenticated users can create/edit
CREATE POLICY "Authenticated users can insert" 
    ON custom_items 
    FOR INSERT 
    WITH CHECK (auth.role() = 'authenticated');
```

3. Add sign-in UI to your app using `@supabase/auth-ui-react`

## 🎯 Database Tables Overview

### custom_items
Add extra info to API items: tips, locations, meta ratings

### custom_quests  
Add walkthroughs, hidden objectives, video guides

### custom_traders
Trader bios, locations, unlock requirements

### custom_locations
Mark important map locations (loot, dangers, resources)

### custom_guides
Player-created guides and tutorials

### custom_builds
Community loadout builds with ratings

## 🐛 Troubleshooting

### "Supabase Not Configured" message

1. ✅ Check `.env` file exists in project root
2. ✅ Verify variable names start with `VITE_`
3. ✅ Restart dev server after creating `.env`
4. ✅ No extra spaces or quotes around values

### Database connection errors

1. ✅ Verify project URL and anon key are correct
2. ✅ Check Supabase project is active (not paused)
3. ✅ Try accessing project in Supabase dashboard
4. ✅ Check browser console for detailed errors

### Tables not found

1. ✅ Re-run the SQL schema in SQL Editor
2. ✅ Check Table Editor to see if tables exist
3. ✅ Verify you're looking at the right project

### Can't insert/update data

1. ✅ Check Row Level Security policies in Table Editor
2. ✅ Verify policies allow public access (or add auth)
3. ✅ Check browser console for RLS errors

## 📊 Monitoring & Maintenance

### View Database Usage

- Dashboard → Usage: See storage and API request limits
- Table Editor: Browse and manually edit data
- SQL Editor: Run custom queries

### Backup Your Data

Supabase auto-backups on paid plans. For free tier:

```bash
# Export table data (requires psql)
pg_dump -h db.xxx.supabase.co -U postgres -d postgres -t custom_items > backup.sql
```

### Monitor API Usage

- Check Dashboard → API → Logs
- Set up alerts in Settings → Integrations

## 🚀 Next Steps

1. ✅ **Add authentication** for production security
2. ✅ **Create sample data** to test the system
3. ✅ **Customize RLS policies** for your needs
4. ✅ **Set up backup strategy**
5. ✅ **Add file storage** for custom images (Supabase Storage)

## 📖 Useful Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [Supabase Auth](https://supabase.com/docs/guides/auth)
- [Database Functions](https://supabase.com/docs/guides/database/functions)

## 💡 Pro Tips

### Use Supabase Studio

Supabase Studio (the web interface) is great for:
- Quick data editing
- Testing queries
- Viewing logs
- Managing users

### Database Functions

Create server-side functions for complex operations:

```sql
CREATE OR REPLACE FUNCTION increment_guide_views(guide_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE custom_guides 
  SET views = views + 1 
  WHERE id = guide_id;
END;
$$ LANGUAGE plpgsql;
```

### Real-time Subscriptions

Listen for database changes in real-time:

```typescript
supabase
  .from('custom_items')
  .on('INSERT', payload => {
    console.log('New item added!', payload.new)
  })
  .subscribe()
```

## 🎉 You're All Set!

Your Supabase backend is ready to store custom data for your Arc Raiders Companion app!

Visit `/admin` to start adding custom data that will enhance the experience for all users.

---

Need help? Check the troubleshooting section or open an issue on GitHub!

