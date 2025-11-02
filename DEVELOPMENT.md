# Development Guide

## Quick Start Commands

```bash
# Development
npm run dev              # Start dev server (http://localhost:5173)

# Building
npm run build           # Build for production
npm run preview         # Preview production build

# Code Quality
npm run lint            # Run linter (if configured)
```

## Component Usage Examples

### Using the Button Component

```tsx
import Button from '@/components/Button'

// Primary button (default)
<Button>Click Me</Button>

// Other variants
<Button variant="secondary">Secondary</Button>
<Button variant="outline">Outline</Button>

// Different sizes
<Button size="sm">Small</Button>
<Button size="md">Medium</Button>
<Button size="lg">Large</Button>
```

### Using the Card Component

```tsx
import Card, { CardHeader, CardTitle, CardContent } from '@/components/Card'

<Card hover>
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
  </CardHeader>
  <CardContent>
    Card content goes here
  </CardContent>
</Card>
```

### Using API Hooks

```tsx
import { useItems, useItem } from '@/hooks/useArcRaidersApi'

// In a component
function ItemsList() {
  const { data: items, isLoading, error } = useItems()
  
  if (isLoading) return <LoadingSpinner />
  if (error) return <div>Error loading items</div>
  
  return (
    <div>
      {items?.map(item => (
        <div key={item.id}>{item.name}</div>
      ))}
    </div>
  )
}
```

## File Structure Guidelines

### Creating a New Page

1. Create file in `src/pages/YourPage.tsx`
2. Add route in `src/App.tsx`
3. Add navigation link in `src/components/Header.tsx`

Example:
```tsx
// src/pages/YourPage.tsx
const YourPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-techno font-bold text-navy-800 mb-3">
          YOUR PAGE
        </h1>
        {/* Your content */}
      </div>
    </div>
  )
}

export default YourPage
```

### Creating a New Component

1. Create file in `src/components/YourComponent.tsx`
2. Follow the existing pattern with TypeScript props
3. Use Tailwind classes for styling

Example:
```tsx
interface YourComponentProps {
  title: string
  description?: string
}

const YourComponent = ({ title, description }: YourComponentProps) => {
  return (
    <div className="bg-white rounded-xl p-6">
      <h3 className="text-xl font-semibold">{title}</h3>
      {description && <p className="text-navy-600">{description}</p>}
    </div>
  )
}

export default YourComponent
```

## Styling Guide

### Color Classes

```tsx
// Primary (beige/cream)
bg-primary-50    // Lightest
bg-primary-500   // Medium
bg-primary-900   // Darkest
text-primary-600

// Accent (orange)
bg-accent-500    // Main orange
text-accent-600
border-accent-400

// Navy (dark blue)
bg-navy-800      // Main navy
text-navy-700
```

### Common Patterns

```tsx
// Page container
<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

// Card with hover
<div className="bg-white rounded-xl border border-primary-200 hover:border-accent-400 p-6 transition-all hover:shadow-lg">

// Button styles
<button className="bg-accent-500 hover:bg-accent-600 text-white font-semibold px-6 py-3 rounded-lg">

// Gradient background
<div className="bg-gradient-to-b from-primary-50 to-white">
```

### Typography

```tsx
// Headings - use font-techno for tech feel
<h1 className="text-4xl font-techno font-bold text-navy-800">

// Body text
<p className="text-navy-600 leading-relaxed">

// Small text
<span className="text-sm text-navy-500">
```

## API Integration

### Adding a New Endpoint

1. Add type interface in `src/hooks/useArcRaidersApi.ts`
2. Create custom hook for that endpoint

```tsx
// Add interface
export interface YourDataType {
  id: string
  name: string
  // ... other fields
}

// Add hook
export const useYourData = () => {
  return useArcRaidersData<YourDataType[]>('your-endpoint')
}
```

### Error Handling

```tsx
const { data, isLoading, error } = useYourData()

if (error) {
  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-6">
      <h2 className="text-xl font-semibold text-red-800">Error</h2>
      <p className="text-red-600">Unable to load data</p>
    </div>
  )
}
```

## Icons

Using Lucide React for all icons:

```tsx
import { Search, Filter, Package, Target, Wrench } from 'lucide-react'

<Search className="w-5 h-5 text-navy-600" />
```

Common icons:
- `Package` - Items
- `Target` - Missions  
- `Wrench` - Crafting
- `Search` - Search
- `Filter` - Filters
- `ArrowLeft` - Back navigation
- `Award` - Rewards

## Responsive Design

Mobile-first approach:

```tsx
// Stack on mobile, grid on larger screens
<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">

// Hide on mobile, show on desktop
<div className="hidden md:block">

// Different padding
<div className="px-4 sm:px-6 lg:px-8">
```

## Performance Tips

1. **React Query handles caching** - No need for manual state management
2. **Use React.memo** for expensive components
3. **Lazy load** images and routes if needed
4. **Virtualize** long lists (consider react-virtual)

## Testing Checklist

- [ ] All pages load without errors
- [ ] Navigation works correctly
- [ ] API data displays properly
- [ ] Loading states show correctly
- [ ] Error states show correctly
- [ ] Mobile responsive
- [ ] Search and filters work
- [ ] Links are functional
- [ ] Console has no errors

## Deployment

### Vercel (Recommended)
```bash
npm install -g vercel
vercel
```

### Netlify
```bash
npm run build
# Deploy dist/ folder
```

### Environment Variables
If needed, create `.env`:
```
VITE_API_BASE_URL=https://metaforge.app/arc-raiders/api
```

Access in code:
```tsx
const apiUrl = import.meta.env.VITE_API_BASE_URL
```

## Troubleshooting

### Dev server won't start
```bash
rm -rf node_modules
npm install
```

### Build errors
```bash
npm run build
# Check error messages
```

### TypeScript errors
```bash
npx tsc --noEmit
```

## Resources

- [React Docs](https://react.dev)
- [TypeScript Docs](https://www.typescriptlang.org/docs)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [TanStack Query Docs](https://tanstack.com/query/latest/docs/react/overview)
- [Lucide Icons](https://lucide.dev/icons)

