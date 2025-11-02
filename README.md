# Arc Raiders Companion

A comprehensive companion website for Arc Raiders players. Explore weapons, items, missions, crafting recipes, and more.

![Arc Raiders Database](mockups/screenshot.png)

## Features

- 🎯 **Items Database** - Browse all weapons, gear, and resources with advanced filtering
- 🎮 **Missions** - View all available missions, objectives, and rewards
- 🔧 **Crafting System** - Discover crafting recipes and required materials
- 🔍 **Search & Filter** - Find what you need quickly with powerful search
- 📱 **Responsive Design** - Works beautifully on all devices
- ⚡ **Fast & Modern** - Built with React, TypeScript, and Vite

## Data Source

This application uses the [Metaforge API](https://metaforge.app/arc-raiders/api) to provide real-time, structured game data.

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/arc-raiders-companion.git
cd arc-raiders-companion
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser to `http://localhost:5173`

### Build for Production

```bash
npm run build
npm run preview
```

## Tech Stack

- **Frontend Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Routing**: React Router
- **Data Fetching**: TanStack Query (React Query)
- **HTTP Client**: Axios
- **Icons**: Lucide React

## Project Structure

```
arc-raiders-companion/
├── src/
│   ├── components/       # Reusable UI components
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   ├── Layout.tsx
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   └── ...
│   ├── pages/           # Page components
│   │   ├── Home.tsx
│   │   ├── Items.tsx
│   │   ├── ItemDetail.tsx
│   │   ├── Missions.tsx
│   │   └── Crafting.tsx
│   ├── hooks/           # Custom React hooks
│   │   └── useArcRaidersApi.ts
│   ├── lib/             # Utility functions
│   │   └── utils.ts
│   ├── App.tsx          # Main app component
│   ├── main.tsx         # Entry point
│   └── index.css        # Global styles
├── public/              # Static assets
├── index.html           # HTML template
└── package.json         # Dependencies
```

## API Endpoints

The app fetches data from these Metaforge API endpoints:

- `/items` - All items in the game
- `/items/:id` - Individual item details
- `/missions` - All missions
- `/recipes` - Crafting recipes

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is not affiliated with or endorsed by Embark Studios. Arc Raiders is a trademark of Embark Studios AB.

## Acknowledgments

- Data provided by [Metaforge](https://metaforge.app/arc-raiders)
- Built with modern web technologies
- Inspired by the Arc Raiders community

## Support

If you find this useful, please give it a ⭐ on GitHub!
