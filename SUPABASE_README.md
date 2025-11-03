# Supabase Backend Integration

This document provides an overview of the Supabase backend integration for the Arc Raiders Companion app.

## 🎯 What Was Added

Your Arc Raiders Companion now has a complete Supabase backend to store and manage custom data that doesn't exist in the Forge API!

### Features

✅ **Custom Data Management** - Store additional information for items, quests, traders, and more  
✅ **Admin Dashboard** - Full-featured admin interface at `/admin`  
✅ **CRUD Operations** - Create, read, update, and delete custom data  
✅ **TypeScript Types** - Fully typed database schema  
✅ **React Query Integration** - Automatic caching and state management  
✅ **Data Merging** - Seamlessly combine API data with custom Supabase data  
✅ **Real-time Ready** - Support for real-time subscriptions  

## 📁 Files Added

### Core Integration
- `src/lib/supabase.ts` - Supabase client and TypeScript types
- `src/hooks/useSupabase.ts` - CRUD hooks for all tables
- `src/hooks/useMergedData.ts` - Hooks to merge API + Supabase data

### Admin Pages
- `src/pages/admin/AdminDashboard.tsx` - Admin dashboard homepage
- `src/pages/admin/CustomItemsAdmin.tsx` - Manage custom items
- `src/pages/admin/CustomItemForm.tsx` - Create/edit custom item form

### Documentation
- `SUPABASE_SETUP_GUIDE.md` - Step-by-step setup instructions
- `SUPABASE_SCHEMA.md` - Complete database schema with SQL
- `ENV_TEMPLATE.md` - Environment variable template
- `INTEGRATION_EXAMPLE.md` - Code examples for using Supabase data
- `SUPABASE_README.md` - This file

### Configuration
- `src/App.tsx` - Updated with admin routes
- `src/components/Header.tsx` - Added admin link to navigation

## 🗄️ Database Tables

### custom_items
Add extra data to API items:
- Tips and tricks
- Where to find items
- Meta ratings (1-5)
- Best use cases
- Custom tags

### custom_quests
Enhance quests with:
- Walkthroughs
- Hidden objectives
- Video guide links
- Map markers
- Time estimates

### custom_traders
Additional trader info:
- Backstory/bio
- Exact locations
- Trading tips
- Unlock requirements

### custom_locations
Mark map locations:
- Loot spots
- Danger zones
- Quest objectives
- Resource nodes
- Landmarks

### custom_guides
Player-created guides:
- Beginner/advanced tutorials
- Build guides
- Farming strategies
- PvP tips

### custom_builds
Loadout builds:
- Weapon/armor combinations
- Playstyle (aggressive/defensive/etc.)
- Pros and cons
- Gameplay tips

## 🚀 Quick Start

### 1. Set Up Supabase (5 minutes)

Follow the detailed guide in `SUPABASE_SETUP_GUIDE.md`:

1. Create Supabase project
2. Get credentials (URL + anon key)
3. Create `.env` file with credentials
4. Run SQL schema in Supabase
5. Restart dev server

### 2. Access Admin Panel

```bash
npm run dev
# Visit http://localhost:5173/admin
```

### 3. Add Custom Data

Navigate to any admin section (e.g., `/admin/items/new`) and create custom data!

## 💻 Usage Examples

### Display Custom Item Data

```tsx
import { useMergedItem } from '@/hooks/useMergedData'
import { useItem } from '@/hooks/useArcRaidersApi'

const ItemDetail = () => {
  const { id } = useParams()
  const { data: apiItem } = useItem(id!)
  const enhancedItem = useMergedItem(apiItem)
  
  return (
    <div>
      <h1>{enhancedItem?.name}</h1>
      
      {/* Show custom tips */}
      {enhancedItem?.tips && (
        <div className="bg-blue-50 p-4 rounded">
          <strong>Tips:</strong> {enhancedItem.tips}
        </div>
      )}
      
      {/* Show community rating */}
      {enhancedItem?.metaRating && (
        <div>⭐ {enhancedItem.metaRating}/5</div>
      )}
    </div>
  )
}
```

### Create Custom Data

```tsx
import { useCreateCustomItem } from '@/hooks/useSupabase'

const MyComponent = () => {
  const createCustomItem = useCreateCustomItem()
  
  const handleCreate = async () => {
    await createCustomItem.mutateAsync({
      item_id: 'herbal-bandage',
      tips: 'Best healing item for early game',
      meta_rating: 4.5,
      locations_found: ['Medical Facility', 'Forest'],
      tags: ['healing', 'consumable']
    })
  }
}
```

### Query Custom Data

```tsx
import { useCustomItems, useCustomItem } from '@/hooks/useSupabase'

// Get all custom items
const { data: customItems } = useCustomItems()

// Get specific custom item by ID
const { data: customItem } = useCustomItem(itemId)

// Get custom item by item_id (API reference)
const { data: customItem } = useCustomItemByItemId('herbal-bandage')
```

More examples in `INTEGRATION_EXAMPLE.md`!

## 🎨 Admin Interface

### Dashboard (`/admin`)
- Overview stats
- Quick actions
- Links to all admin sections

### Custom Items (`/admin/items`)
- List all custom items
- Search and filter
- Create/edit/delete

### Forms
- User-friendly forms
- Array input (tags, locations)
- Validation
- Real-time save

## 🔒 Security

### Current Setup
- Public read/write access (RLS enabled but permissive)
- Suitable for development and community wikis
- No authentication required

### Production Recommendations
1. **Add Authentication** - Use Supabase Auth
2. **Restrict Write Access** - Only allow authenticated users to write
3. **Add Role-Based Access** - Admin, moderator, user roles
4. **Enable Audit Logs** - Track who changes what
5. **Rate Limiting** - Prevent abuse

See `SUPABASE_SCHEMA.md` for policy examples.

## 📊 Data Flow

```
┌─────────────┐
│ Forge API   │ ← External game data
└──────┬──────┘
       │
       ↓
┌─────────────────────┐
│ React Components    │
└──────┬──────────────┘
       │
       ├──→ useArcRaidersApi hooks ← API data
       │
       ├──→ useSupabase hooks ← Custom data
       │
       └──→ useMergedData hooks ← Combined data
              │
              ↓
       ┌─────────────┐
       │ Supabase DB │ ← Your custom data
       └─────────────┘
```

## 🔧 Customization

### Add New Custom Tables

1. Add table definition to `src/lib/supabase.ts`
2. Create hooks in `src/hooks/useSupabase.ts`
3. Add SQL schema to `SUPABASE_SCHEMA.md`
4. Create admin page for managing data
5. Add route in `src/App.tsx`

### Modify Existing Tables

1. Update SQL schema in Supabase
2. Update TypeScript types in `src/lib/supabase.ts`
3. Update admin forms if needed

### Custom Queries

Use the Supabase client directly for complex queries:

```tsx
import { supabase } from '@/lib/supabase'

const getTopRatedItems = async () => {
  const { data, error } = await supabase
    .from('custom_items')
    .select('*')
    .order('meta_rating', { ascending: false })
    .limit(10)
  
  return data
}
```

## 📈 Monitoring

### Check Database Usage
- Supabase Dashboard → Usage
- Monitor storage, API requests, bandwidth

### View Logs
- Supabase Dashboard → API → Logs
- See all queries and errors

### Analytics
- Track popular items/guides
- Monitor user engagement
- Identify content gaps

## 🐛 Troubleshooting

### "Supabase Not Configured"
✅ Create `.env` file with credentials  
✅ Restart dev server  
✅ Check for typos in env vars  

### Database Errors
✅ Check Table Editor in Supabase  
✅ Verify Row Level Security policies  
✅ Check browser console for details  

### Type Errors
✅ Ensure types match database schema  
✅ Run `npm run build` to check TypeScript  

## 📚 Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [React Query Docs](https://tanstack.com/query/latest)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)

## 🎉 What's Next?

1. **Add Authentication** - Let users sign in
2. **User Profiles** - Track who contributes what
3. **Voting System** - Let community vote on guides/builds
4. **Comments** - Add discussion to guides
5. **File Upload** - Store custom images in Supabase Storage
6. **Search** - Full-text search across custom data
7. **Notifications** - Email updates for new content

## 🤝 Contributing

To add new admin sections:

1. Create admin page in `src/pages/admin/`
2. Add route in `src/App.tsx`
3. Add card to admin dashboard
4. Follow existing patterns for consistency

## 📝 Notes

- Supabase free tier includes:
  - 500MB database
  - 1GB file storage
  - 50MB file uploads
  - 2GB bandwidth
  
- All custom data is cached for 5 minutes by default
- React Query handles automatic refetching and cache invalidation
- Custom data is optional - app works fine without Supabase

## ✅ Checklist

Before deploying to production:

- [ ] Set up Supabase project
- [ ] Configure environment variables
- [ ] Run database schema
- [ ] Test admin functionality
- [ ] Configure Row Level Security for production
- [ ] Add authentication (if needed)
- [ ] Set up database backups
- [ ] Configure monitoring/alerts
- [ ] Test with real data
- [ ] Document custom data requirements for contributors

---

**Need help?** Check the guides in this directory or open an issue!

Built with ❤️ using Supabase + React + TypeScript

