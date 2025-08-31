# Local Impact - Transaction Management App

A comprehensive business transaction management application built with React and Vite. Perfect for managing daily transactions, parties, items, and generating reports.

## Features

- 📊 **Today's Transactions** - View and manage daily transactions
- 💼 **Transaction Management** - Complete transaction tracking with calculations
- 👥 **Parties Management** - Manage business parties/customers
- 📦 **Items Management** - Track inventory items with rates
- 📈 **Reports** - Generate business reports
- 📱 **Responsive Design** - Works on desktop and mobile devices
- 💾 **Local Storage** - Data persists in browser localStorage
- 🎨 **Modern UI** - Built with Tailwind CSS and Flowbite React

## Tech Stack

- **Frontend**: React 19.1.1
- **Build Tool**: Vite 7.1.2
- **Routing**: React Router DOM 7.8.2
- **UI Components**: Flowbite React 0.12.7
- **Styling**: Tailwind CSS 4.1.12
- **Data Storage**: Browser localStorage

## Getting Started

### Prerequisites

- Node.js (version 18 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd local-impact-app
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Project Structure

```
src/
├── components/
│   └── Header.jsx          # Navigation header with responsive menu
├── screens/
│   ├── TodayScreen.jsx     # Daily transactions view
│   ├── TransactionScreen.jsx # Transaction management
│   ├── PartiesScreen.jsx   # Parties/customers management
│   ├── ItemsScreen.jsx     # Items/inventory management
│   └── ReportsScreen.jsx   # Reports and analytics
├── lib/
│   ├── storage.js          # localStorage utilities
│   └── dummyData.js        # Sample data for testing
└── assets/                 # Static assets and images
```

## Features Overview

### Transaction Management
- Add, edit, and delete transactions
- Calculate totals with commission and additional charges
- Multiple payment modes (Cash, UPI, Card)
- Transaction status tracking
- Advanced filtering and sorting

### Data Management
- Purge all data functionality
- Load dummy data for testing
- Export capabilities
- Data persistence across sessions

### Responsive Design
- Mobile-first approach
- Hamburger menu for mobile navigation
- Optimized layouts for all screen sizes

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Deployment

This app can be easily deployed on:
- Cloudflare Pages
- Vercel
- Netlify
- GitHub Pages

For Cloudflare Pages deployment:
1. Connect your GitHub repository
2. Set build command: `npm run build`
3. Set output directory: `dist`

## Support

If you encounter any issues or have questions, please open an issue on GitHub.+ Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
