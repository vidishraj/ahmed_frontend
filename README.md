# NCEC KPI Platform - Frontend

React-based frontend for the NCEC KPI Platform, providing interactive dashboards and real-time monitoring capabilities for power generating stations.

## Tech Stack

- **Framework:** React with TypeScript
- **Build Tool:** Vite
- **UI Library:** Material-UI (MUI)
- **State Management:** React Context
- **Authentication:** Firebase
- **Charts:** Recharts
- **Maps:** Leaflet
- **HTTP Client:** Axios

## Project Structure

```
src/
├── assets/          # Static assets (images, icons)
├── components/      # Reusable UI components
│   ├── dashboard/   # Dashboard-specific components
│   └── ...         # Other component categories
├── contexts/        # React Context providers
├── pages/          # Page components
├── types/          # TypeScript type definitions
├── App.tsx         # Main application component
└── main.tsx        # Application entry point
```

## Prerequisites

- Node.js 16+
- npm or yarn
- Firebase project credentials

## Getting Started

1. **Clone the repository and navigate to frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Environment Setup:**
   ```bash
   cp env.example .env
   ```
   Configure the following variables in `.env`:
   ```
   VITE_API_BASE_URL=http://localhost:8000
   VITE_FIREBASE_API_KEY=your-api-key
   VITE_FIREBASE_AUTH_DOMAIN=your-auth-domain
   VITE_FIREBASE_PROJECT_ID=your-project-id
   VITE_FIREBASE_STORAGE_BUCKET=your-storage-bucket
   VITE_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
   VITE_FIREBASE_APP_ID=your-app-id
   ```

## Development

1. **Start development server:**
   ```bash
   npm run dev
   # or
   yarn dev
   ```
   This will start the development server at `http://localhost:5173`

2. **Run type checking:**
   ```bash
   npm run typecheck
   # or
   yarn typecheck
   ```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint
- `npm run typecheck` - Run TypeScript type checking

## Key Features

1. **Dashboard**
   - Real-time KPI monitoring
   - Interactive charts and graphs
   - Map view with plant locations
   - Customizable filters

2. **User Management**
   - Role-based access control
   - User authentication with Firebase
   - Profile management

3. **Data Management**
   - File upload interface
   - Policy document management
   - Data visualization tools

4. **Environmental Monitoring**
   - Emissions compliance tracking
   - Water waste monitoring
   - Performance metrics visualization

## Component Guidelines

1. **File Naming:**
   - Use PascalCase for component files
   - Add `.tsx` extension for TypeScript components

2. **Component Structure:**
   ```typescript
   import React from 'react';
   
   interface Props {
     // Define props here
   }
   
   export const ComponentName: React.FC<Props> = ({ prop1, prop2 }) => {
     return (
       // JSX here
     );
   };
   ```

3. **Styling:**
   - Use MUI's `sx` prop for component-specific styling
   - Follow the project's color scheme:
     ```typescript
     const colors = {
       darkest: '#266541',
       dark: '#86b29a',
       light: '#b8e3cb',
       lightest: '#effaf5'
     };
     ```

## Build for Production

1. **Create production build:**
   ```bash
   npm run build
   # or
   yarn build
   ```
   This will generate optimized files in the `dist` directory.

2. **Preview production build:**
   ```bash
   npm run preview
   # or
   yarn preview
   ```

## Troubleshooting

1. **Common Issues:**
   - "Module not found" - Run `npm install` to update dependencies
   - TypeScript errors - Run `npm run typecheck` for detailed information
   - Build failures - Check environment variables and dependencies

2. **Development Server Issues:**
   - Clear browser cache
   - Check for port conflicts
   - Verify API endpoint configuration
