# API Endpoints Documentation

Base URL: `http://localhost:5000/api`

## Authentication

### Register User
- **POST** `/auth/register`
- **Access**: Public
- **Body**:
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "Employee",
  "department": "IT",
  "phone": "1234567890"
}
```
- **Response**: `{ success: true, token: "...", user: {...} }`

### Login
- **POST** `/auth/login`
- **Access**: Public
- **Body**:
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```
- **Response**: `{ success: true, token: "...", user: {...} }`

### Get Current User
- **GET** `/auth/me`
- **Access**: Protected
- **Headers**: `Authorization: Bearer <token>`
- **Response**: `{ success: true, user: {...} }`

## Users

### Get All Users
- **GET** `/users`
- **Access**: Admin, IT Staff
- **Query Params**: None
- **Response**: `{ success: true, count: 10, data: [...] }`

### Get Single User
- **GET** `/users/:id`
- **Access**: Admin, IT Staff
- **Response**: `{ success: true, data: {...} }`

### Update User
- **PUT** `/users/:id`
- **Access**: Admin, IT Staff
- **Body**: `{ name, email, role, isActive, ... }`
- **Response**: `{ success: true, data: {...} }`

### Delete User
- **DELETE** `/users/:id`
- **Access**: Admin only
- **Response**: `{ success: true, message: "User deleted" }`

## Assets

### Get All Assets
- **GET** `/assets`
- **Access**: Protected
- **Query Params**:
  - `page` (default: 1)
  - `limit` (default: 10)
  - `status` (In Use, In Stock, Under Repair, Retired)
  - `category` (category ID)
  - `assignedTo` (user ID)
  - `search` (search term)
- **Response**: `{ success: true, count: 10, total: 100, page: 1, pages: 10, data: [...] }`

### Get Single Asset
- **GET** `/assets/:id`
- **Access**: Protected
- **Response**: `{ success: true, data: {...} }`

### Create Asset
- **POST** `/assets`
- **Access**: Admin, IT Staff
- **Body** (multipart/form-data for image upload):
```json
{
  "assetTag": "AST-000001",
  "name": "Dell Laptop",
  "category": "category_id",
  "brand": "Dell",
  "model": "Latitude 5520",
  "serialNumber": "SN123456",
  "status": "In Stock",
  "location": "Office A",
  "purchaseDate": "2023-01-15",
  "purchasePrice": 1200,
  "warrantyExpiry": "2026-01-15",
  "vendor": "vendor_id",
  "description": "Laptop description"
}
```
- **Response**: `{ success: true, data: {...} }`

### Update Asset
- **PUT** `/assets/:id`
- **Access**: Admin, IT Staff
- **Body**: Same as create
- **Response**: `{ success: true, data: {...} }`

### Delete Asset
- **DELETE** `/assets/:id`
- **Access**: Admin only
- **Response**: `{ success: true, message: "Asset deleted" }`

### Assign Asset
- **POST** `/assets/:id/assign`
- **Access**: Admin, IT Staff
- **Body**: `{ assignedTo: "user_id" }`
- **Response**: `{ success: true, data: {...} }`

### Return Asset
- **POST** `/assets/:id/return`
- **Access**: Admin, IT Staff
- **Response**: `{ success: true, data: {...} }`

## Categories

### Get All Categories
- **GET** `/categories`
- **Access**: Protected
- **Response**: `{ success: true, count: 5, data: [...] }`

### Create Category
- **POST** `/categories`
- **Access**: Admin, IT Staff
- **Body**: `{ name: "Laptop", description: "Laptop category" }`
- **Response**: `{ success: true, data: {...} }`

### Update Category
- **PUT** `/categories/:id`
- **Access**: Admin, IT Staff
- **Body**: `{ name, description }`
- **Response**: `{ success: true, data: {...} }`

### Delete Category
- **DELETE** `/categories/:id`
- **Access**: Admin only
- **Response**: `{ success: true, message: "Category deleted" }`

## Vendors

### Get All Vendors
- **GET** `/vendors`
- **Access**: Protected
- **Response**: `{ success: true, count: 5, data: [...] }`

### Create Vendor
- **POST** `/vendors`
- **Access**: Admin, IT Staff
- **Body**:
```json
{
  "name": "Dell Inc",
  "contactPerson": "John Smith",
  "email": "contact@dell.com",
  "phone": "1234567890",
  "address": "123 Main St",
  "website": "https://dell.com"
}
```
- **Response**: `{ success: true, data: {...} }`

### Update Vendor
- **PUT** `/vendors/:id`
- **Access**: Admin, IT Staff
- **Body**: Same as create
- **Response**: `{ success: true, data: {...} }`

### Delete Vendor
- **DELETE** `/vendors/:id`
- **Access**: Admin only
- **Response**: `{ success: true, message: "Vendor deleted" }`

## Assignments

### Get All Assignments
- **GET** `/assignments`
- **Access**: Protected
- **Query Params**:
  - `status` (Active, Returned, Lost, Damaged)
  - `assignedTo` (user ID)
- **Response**: `{ success: true, count: 10, data: [...] }`

### Create Assignment
- **POST** `/assignments`
- **Access**: Admin, IT Staff
- **Body**:
```json
{
  "asset": "asset_id",
  "assignedTo": "user_id",
  "expectedReturnDate": "2024-12-31",
  "condition": "Good",
  "notes": "Assignment notes"
}
```
- **Response**: `{ success: true, data: {...} }`

### Return Assignment
- **PUT** `/assignments/:id/return`
- **Access**: Admin, IT Staff
- **Response**: `{ success: true, data: {...} }`

## Maintenance

### Get All Maintenance Records
- **GET** `/maintenance`
- **Access**: Protected
- **Query Params**:
  - `asset` (asset ID)
  - `status` (Scheduled, In Progress, Completed, Cancelled)
- **Response**: `{ success: true, count: 10, data: [...] }`

### Create Maintenance Record
- **POST** `/maintenance`
- **Access**: Admin, IT Staff
- **Body**:
```json
{
  "asset": "asset_id",
  "maintenanceType": "Repair",
  "description": "Screen replacement",
  "performedBy": "Technician Name",
  "vendor": "vendor_id",
  "cost": 500,
  "startDate": "2023-10-01",
  "endDate": "2023-10-05",
  "status": "Scheduled",
  "notes": "Maintenance notes"
}
```
- **Response**: `{ success: true, data: {...} }`

### Update Maintenance Record
- **PUT** `/maintenance/:id`
- **Access**: Admin, IT Staff
- **Body**: Same as create
- **Response**: `{ success: true, data: {...} }`

## Licenses

### Get All Licenses
- **GET** `/licenses`
- **Access**: Protected
- **Query Params**:
  - `status` (Active, Expired, Suspended, Unused)
  - `softwareName` (search term)
- **Response**: `{ success: true, count: 10, data: [...] }`

### Create License
- **POST** `/licenses`
- **Access**: Admin, IT Staff
- **Body**:
```json
{
  "licenseKey": "LIC-123456",
  "softwareName": "Microsoft Office",
  "vendor": "vendor_id",
  "licenseType": "Subscription",
  "purchaseDate": "2023-01-01",
  "expiryDate": "2024-01-01",
  "cost": 150,
  "seats": 10,
  "status": "Active"
}
```
- **Response**: `{ success: true, data: {...} }`

### Assign License
- **POST** `/licenses/:id/assign`
- **Access**: Admin, IT Staff
- **Body**: `{ userId: "user_id" }`
- **Response**: `{ success: true, data: {...} }`

### Update License
- **PUT** `/licenses/:id`
- **Access**: Admin, IT Staff
- **Body**: Same as create
- **Response**: `{ success: true, data: {...} }`

## Reports

### Get Dashboard Statistics
- **GET** `/reports/dashboard`
- **Access**: Protected
- **Response**:
```json
{
  "success": true,
  "data": {
    "assets": {
      "total": 100,
      "inUse": 50,
      "inStock": 30,
      "underRepair": 10,
      "retired": 10,
      "byCategory": [...],
      "byStatus": [...]
    },
    "users": {
      "total": 25
    },
    "assignments": {
      "active": 50
    },
    "maintenance": {
      "pending": 5
    },
    "licenses": {
      "active": 15,
      "expiring": 3
    },
    "recentAssignments": [...],
    "warrantyExpiring": [...]
  }
}
```

## Error Responses

All endpoints may return error responses in the following format:

```json
{
  "message": "Error message",
  "errors": [...]  // For validation errors
}
```

Common HTTP Status Codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Server Error

## Authentication

Most endpoints require authentication. Include the JWT token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```
