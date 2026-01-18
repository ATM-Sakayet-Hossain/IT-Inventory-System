# IT Inventory Management System

A comprehensive full-stack IT Inventory Management System built with React.js, Node.js, Express.js, and MongoDB.

## Features

### Core Modules
- **User Authentication** - JWT-based authentication with role-based access control (Admin, IT Staff, Employee)
- **Asset Management** - Complete CRUD operations for IT assets
- **Asset Categories** - Organize assets by categories (Laptop, Desktop, Printer, Network Devices, etc.)
- **Employee/User Management** - Manage system users and their roles
- **Asset Assignment and Tracking** - Track asset assignments to employees
- **Vendor Management** - Manage vendor information
- **Maintenance and Repair History** - Track maintenance and repair records
- **Software License Management** - Manage software licenses and assignments
- **Reports and Dashboard Analytics** - Comprehensive dashboard with statistics and charts

### Functional Requirements
- ✅ JWT-based authentication and authorization
- ✅ CRUD operations for assets and users
- ✅ QR code support for asset identification
- ✅ Asset check-in / check-out system
- ✅ Search and filter assets
- ✅ Asset status tracking (In Use, In Stock, Under Repair, Retired)
- ✅ Role-based access control
- ✅ File upload for asset images
- ✅ Responsive UI using Material UI

## Technology Stack

### Frontend
- React.js 18
- Material UI (MUI)
- React Router DOM
- Axios
- Recharts (for charts)
- React QR Code
- React Toastify

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- JWT (JSON Web Tokens)
- Bcryptjs (password hashing)
- Multer (file uploads)
- Express Validator

## Project Structure

```
IT Inventory Management System/
├── Client/                 # React Frontend
│   ├── public/
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── context/       # React Context (Auth)
│   │   ├── pages/         # Page components
│   │   ├── App.js
│   │   └── index.js
│   └── package.json
├── Server/                 # Node.js Backend
│   ├── config/            # Configuration files
│   ├── middleware/        # Custom middleware
│   ├── models/            # MongoDB models
│   ├── routes/            # API routes
│   ├── uploads/           # Uploaded files
│   ├── server.js
│   └── package.json
└── README.md
```

## Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn

### Backend Setup

1. Navigate to the Server directory:
```bash
cd Server
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the Server directory:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/it_inventory
JWT_SECRET=your_jwt_secret_key_here_change_in_production
JWT_EXPIRE=7d
NODE_ENV=development
```

4. Create the uploads directory:
```bash
mkdir uploads
```

5. Start the server:
```bash
# Development mode
npm run dev

# Production mode
npm start
```

The server will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to the Client directory:
```bash
cd Client
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

The frontend will run on `http://localhost:3000`

## Database Schema

### User Model
- name (String, required)
- email (String, required, unique)
- password (String, required, hashed)
- role (Enum: Admin, IT Staff, Employee)
- department (String)
- phone (String)
- isActive (Boolean, default: true)

### Asset Model
- assetTag (String, required, unique)
- name (String, required)
- category (ObjectId, ref: Category)
- brand (String)
- model (String)
- serialNumber (String, unique)
- status (Enum: In Use, In Stock, Under Repair, Retired)
- location (String)
- purchaseDate (Date)
- purchasePrice (Number)
- warrantyExpiry (Date)
- vendor (ObjectId, ref: Vendor)
- assignedTo (ObjectId, ref: User)
- assignedDate (Date)
- description (String)
- image (String)
- barcode (String)
- qrCode (String)
- specifications (Map)

### Category Model
- name (String, required, unique)
- description (String)

### Vendor Model
- name (String, required)
- contactPerson (String)
- email (String)
- phone (String)
- address (String)
- website (String)
- isActive (Boolean, default: true)

### Assignment Model
- asset (ObjectId, ref: Asset, required)
- assignedTo (ObjectId, ref: User, required)
- assignedBy (ObjectId, ref: User, required)
- assignedDate (Date, required)
- returnDate (Date)
- expectedReturnDate (Date)
- condition (Enum: Excellent, Good, Fair, Poor)
- notes (String)
- status (Enum: Active, Returned, Lost, Damaged)

### Maintenance Model
- asset (ObjectId, ref: Asset, required)
- maintenanceType (Enum: Repair, Preventive, Upgrade, Inspection)
- description (String, required)
- performedBy (String)
- vendor (ObjectId, ref: Vendor)
- cost (Number)
- startDate (Date)
- endDate (Date)
- status (Enum: Scheduled, In Progress, Completed, Cancelled)
- notes (String)
- nextMaintenanceDate (Date)

### License Model
- licenseKey (String, required, unique)
- softwareName (String, required)
- vendor (ObjectId, ref: Vendor)
- licenseType (Enum: Perpetual, Subscription, Open Source, Trial)
- purchaseDate (Date)
- expiryDate (Date)
- cost (Number)
- seats (Number, default: 1)
- usedSeats (Number, default: 0)
- assignedTo (Array of {user, assignedDate})
- status (Enum: Active, Expired, Suspended, Unused)
- notes (String)

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (Protected)

### Users
- `GET /api/users` - Get all users (Admin, IT Staff)
- `GET /api/users/:id` - Get single user (Admin, IT Staff)
- `PUT /api/users/:id` - Update user (Admin, IT Staff)
- `DELETE /api/users/:id` - Delete user (Admin)

### Assets
- `GET /api/assets` - Get all assets with filters (Protected)
- `GET /api/assets/:id` - Get single asset (Protected)
- `POST /api/assets` - Create asset (Admin, IT Staff)
- `PUT /api/assets/:id` - Update asset (Admin, IT Staff)
- `DELETE /api/assets/:id` - Delete asset (Admin)
- `POST /api/assets/:id/assign` - Assign asset to user (Admin, IT Staff)
- `POST /api/assets/:id/return` - Return asset (Admin, IT Staff)

### Categories
- `GET /api/categories` - Get all categories (Protected)
- `POST /api/categories` - Create category (Admin, IT Staff)
- `PUT /api/categories/:id` - Update category (Admin, IT Staff)
- `DELETE /api/categories/:id` - Delete category (Admin)

### Vendors
- `GET /api/vendors` - Get all vendors (Protected)
- `POST /api/vendors` - Create vendor (Admin, IT Staff)
- `PUT /api/vendors/:id` - Update vendor (Admin, IT Staff)
- `DELETE /api/vendors/:id` - Delete vendor (Admin)

### Assignments
- `GET /api/assignments` - Get all assignments (Protected)
- `POST /api/assignments` - Create assignment (Admin, IT Staff)
- `PUT /api/assignments/:id/return` - Return assignment (Admin, IT Staff)

### Maintenance
- `GET /api/maintenance` - Get all maintenance records (Protected)
- `POST /api/maintenance` - Create maintenance record (Admin, IT Staff)
- `PUT /api/maintenance/:id` - Update maintenance record (Admin, IT Staff)

### Licenses
- `GET /api/licenses` - Get all licenses (Protected)
- `POST /api/licenses` - Create license (Admin, IT Staff)
- `POST /api/licenses/:id/assign` - Assign license to user (Admin, IT Staff)
- `PUT /api/licenses/:id` - Update license (Admin, IT Staff)

### Reports
- `GET /api/reports/dashboard` - Get dashboard statistics (Protected)

## Role-Based Access Control

### Admin
- Full access to all features
- Can manage users, assets, categories, vendors
- Can delete records
- Can view all reports

### IT Staff
- Can manage assets, categories, vendors
- Can create assignments and maintenance records
- Can view reports
- Cannot delete users or manage user roles

### Employee
- Can view assets assigned to them
- Can view their assignments
- Limited access to other features

## Default User Creation

To create the first admin user, you can use the registration endpoint or create it directly in MongoDB:

```javascript
// Using the API
POST /api/auth/register
{
  "name": "Admin User",
  "email": "admin@example.com",
  "password": "admin123",
  "role": "Admin"
}
```

## Usage

1. Start MongoDB service
2. Start the backend server (Server directory)
3. Start the frontend development server (Client directory)
4. Navigate to `http://localhost:3000`
5. Login with your credentials

## Development

### Backend Development
- Server runs on port 5000
- Uses nodemon for auto-reload in development
- MongoDB connection string configured in `.env`

### Frontend Development
- React app runs on port 3000
- Proxy configured to backend API
- Hot reload enabled

## Production Deployment

1. Build the React app:
```bash
cd Client
npm run build
```

2. Set environment variables in production
3. Use a process manager like PM2 for Node.js
4. Configure MongoDB Atlas or production MongoDB instance
5. Set up proper security (HTTPS, CORS, etc.)

## Security Considerations

- Change JWT_SECRET in production
- Use strong passwords
- Enable HTTPS in production
- Configure CORS properly
- Validate all inputs
- Use environment variables for sensitive data
- Implement rate limiting
- Regular security updates

## License

This project is open source and available under the MIT License.

## Support

For issues and questions, please create an issue in the repository.
