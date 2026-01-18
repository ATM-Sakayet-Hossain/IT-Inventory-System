# IT Inventory Management System - Backend

Node.js and Express.js backend server for the IT Inventory Management System.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/it_inventory
JWT_SECRET=your_jwt_secret_key_here_change_in_production
JWT_EXPIRE=7d
NODE_ENV=development
```

3. Create uploads directory:
```bash
mkdir uploads
```

4. Start the server:
```bash
npm run dev  # Development with nodemon
npm start    # Production
```

## API Documentation

See main README.md for complete API endpoint documentation.

## File Structure

```
Server/
├── config/
│   └── db.js              # MongoDB connection
├── middleware/
│   ├── auth.js             # JWT authentication middleware
│   └── upload.js           # File upload middleware
├── models/
│   ├── User.js
│   ├── Asset.js
│   ├── Category.js
│   ├── Vendor.js
│   ├── Assignment.js
│   ├── Maintenance.js
│   └── License.js
├── routes/
│   ├── auth.js
│   ├── users.js
│   ├── assets.js
│   ├── categories.js
│   ├── vendors.js
│   ├── assignments.js
│   ├── maintenance.js
│   ├── licenses.js
│   └── reports.js
├── uploads/                # Uploaded files directory
├── server.js               # Main server file
└── package.json
```
