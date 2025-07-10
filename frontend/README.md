# Affiliate Marketing Dashboard - React Frontend

A beautiful, modern React dashboard built with CoreUI for managing affiliate marketing campaigns across Amazon Brazil and Shopee.

## 🚀 Features

- **Beautiful UI/UX**: Professional dashboard with CoreUI components
- **Dark Mode**: Toggle between light and dark themes
- **Responsive Design**: Works perfectly on desktop and mobile
- **Real-time Analytics**: Beautiful charts and metrics
- **Product Search**: Find and promote products from Amazon and Shopee
- **Campaign Management**: Create and track marketing campaigns
- **Portuguese Language**: Fully localized for Brazilian users

## 📸 Screenshots

The dashboard includes:
- Overview with key metrics and charts
- Product search with affiliate link generation
- Campaign creation and management
- Advanced analytics with performance tracking

## 🛠️ Tech Stack

- **React 18** with Vite (fast build tool)
- **CoreUI React** - Enterprise-grade UI components
- **React Router** - Client-side routing
- **Chart.js** - Beautiful charts and graphs
- **Axios** - API communication
- **Sass** - Advanced styling

## 🚦 Getting Started

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Start development server**:
   ```bash
   npm run dev
   ```

3. **Build for production**:
   ```bash
   npm run build
   ```

## 🔌 Backend Integration

The frontend connects to the affiliate-mcp-server backend API. Make sure the backend is running on `http://localhost:3000`.

### Authentication
- Login endpoint: `POST /api/auth/login`
- JWT token stored in localStorage
- Protected routes require Bearer token

### API Endpoints Used
- `/api/auth/*` - Authentication
- `/api/products/*` - Product search and affiliate links
- `/api/campaigns/*` - Campaign management
- `/api/analytics/*` - Analytics data

## 📁 Project Structure

```
frontend/
├── src/
│   ├── components/      # Reusable components
│   ├── layout/         # Layout components (sidebar, header)
│   ├── views/          # Page components
│   │   ├── dashboard/  # Dashboard page
│   │   ├── products/   # Product search page
│   │   ├── campaigns/  # Campaign management
│   │   └── analytics/  # Analytics page
│   ├── scss/           # Styles
│   ├── App.jsx         # Main app with routing
│   └── main.jsx        # Entry point
├── public/             # Static assets
└── package.json        # Dependencies
```

## 🎨 Customization

### Theme Colors
Edit `src/scss/style.scss` to change theme colors:
```scss
$primary: #321FDB;    // Main brand color
$success: #2EB85C;    // Success actions
$info: #39F;          // Information
$warning: #F9B115;    // Warnings
$danger: #E55353;     // Errors/danger
```

### Adding New Pages
1. Create component in `src/views/yourpage/`
2. Add route in `src/App.jsx`
3. Add navigation item in `src/layout/DefaultLayout.jsx`

## 🚀 Deployment

### Vercel (Recommended)
1. Push to GitHub
2. Import project on Vercel
3. Set environment variables if needed
4. Deploy!

### Build Locally
```bash
npm run build
# Serve dist/ folder with any static server
```

## 📱 Mobile Support

The dashboard is fully responsive and works great on:
- Desktop (1920px+)
- Tablet (768px - 1024px)
- Mobile (320px - 767px)

## 🐛 Troubleshooting

### Common Issues
1. **CORS errors**: Make sure backend allows frontend origin
2. **Auth errors**: Check JWT token in localStorage
3. **Build errors**: Clear node_modules and reinstall

## 📄 License

MIT License - feel free to use for your projects!
