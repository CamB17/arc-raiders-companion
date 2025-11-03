# Environment Variables Template

Create a `.env` file in the project root with the following variables:

```env
# Supabase Configuration
# Get these from your Supabase project settings: https://supabase.com/dashboard/project/_/settings/api

VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key-here
```

## Instructions

1. **Copy this template**: Create a new file called `.env` in the project root
2. **Get Supabase credentials**:
   - Go to [Supabase Dashboard](https://supabase.com/dashboard)
   - Select your project
   - Go to Settings → API
   - Copy the Project URL (VITE_SUPABASE_URL)
   - Copy the anon public key (VITE_SUPABASE_ANON_KEY)
3. **Replace values** in your `.env` file with your actual credentials
4. **Restart dev server**: Run `npm run dev` to apply the changes

## Security Notes

- ✅ The `.env` file is gitignored and won't be committed
- ✅ Never commit your actual credentials to version control
- ✅ The `anon` key is safe for client-side use (protected by Row Level Security)
- ⚠️ In production, consider using environment variables from your hosting platform

## Example

Your `.env` file should look like this:

```env
VITE_SUPABASE_URL=https://abcdefghijklmnop.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTYyMzk3ODUyMCwiZXhwIjoxOTM5NTU0NTIwfQ.example-key-do-not-use
```

## Verification

After setting up your `.env` file:

1. Restart your dev server: `npm run dev`
2. Visit: `http://localhost:5173/admin`
3. You should see "Supabase Connected" if configured correctly
4. If you see the setup instructions, check your `.env` file

## Troubleshooting

### "Supabase Not Configured" message

1. Make sure `.env` file exists in the project root (same folder as `package.json`)
2. Check that variable names start with `VITE_` (required for Vite)
3. Restart your development server after creating/editing `.env`
4. Verify credentials are correct (no extra spaces or quotes)

### Connection errors

1. Check Supabase project is active and running
2. Verify API URL and key from Supabase dashboard
3. Check browser console for detailed error messages
4. Ensure Row Level Security policies are set up correctly

