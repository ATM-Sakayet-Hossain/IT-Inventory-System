# IT Inventory Management System - Frontend

React.js frontend application for the IT Inventory Management System.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm start
```

The app will open at `http://localhost:3000`

## Build for Production

```bash
npm run build
```

This creates an optimized production build in the `build` folder.

## File Structure

```
Client/
├── public/
│   └── index.html
├── src/
│   ├── components/
│   │   ├── Layout.js          # Main layout with sidebar
│   │   └── PrivateRoute.js    # Protected route component
│   ├── context/
│   │   └── AuthContext.js      # Authentication context
│   ├── pages/
│   │   ├── Login.js
│   │   ├── Dashboard.js
│   │   ├── Assets.js
│   │   ├── AssetForm.js
│   │   ├── AssetDetail.js
│   │   ├── Users.js
│   │   ├── Categories.js
│   │   ├── Vendors.js
│   │   ├── Assignments.js
│   │   ├── Maintenance.js
│   │   ├── Licenses.js
│   │   └── Reports.js
│   ├── App.js                 # Main app component
│   ├── index.js               # Entry point
│   └── index.css
└── package.json
```

## Features

- Material UI components for modern UI
- React Router for navigation
- Axios for API calls
- JWT authentication
- Role-based access control
- Responsive design
- QR code generation for assets
- Charts and analytics dashboard
