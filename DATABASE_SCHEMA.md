# Database Schema Documentation

This document describes the MongoDB database schema for the IT Inventory Management System.

## Collections

### Users Collection

```javascript
{
  _id: ObjectId,
  name: String (required),
  email: String (required, unique, lowercase),
  password: String (required, hashed, minlength: 6),
  role: String (enum: ['Admin', 'IT Staff', 'Employee'], default: 'Employee'),
  department: String,
  phone: String,
  isActive: Boolean (default: true),
  createdAt: Date (default: Date.now)
}
```

**Indexes:**
- `email`: unique

**Methods:**
- `getSignedJwtToken()`: Returns JWT token
- `matchPassword(enteredPassword)`: Compares password

---

### Categories Collection

```javascript
{
  _id: ObjectId,
  name: String (required, unique),
  description: String,
  createdAt: Date (default: Date.now)
}
```

**Indexes:**
- `name`: unique

---

### Vendors Collection

```javascript
{
  _id: ObjectId,
  name: String (required),
  contactPerson: String,
  email: String (lowercase),
  phone: String,
  address: String,
  website: String,
  isActive: Boolean (default: true),
  createdAt: Date (default: Date.now)
}
```

---

### Assets Collection

```javascript
{
  _id: ObjectId,
  assetTag: String (required, unique, uppercase),
  name: String (required),
  category: ObjectId (ref: 'Category', required),
  brand: String,
  model: String,
  serialNumber: String (unique, sparse),
  status: String (enum: ['In Use', 'In Stock', 'Under Repair', 'Retired'], default: 'In Stock'),
  location: String,
  purchaseDate: Date,
  purchasePrice: Number,
  warrantyExpiry: Date,
  vendor: ObjectId (ref: 'Vendor'),
  assignedTo: ObjectId (ref: 'User', default: null),
  assignedDate: Date,
  description: String,
  image: String,
  barcode: String,
  qrCode: String,
  specifications: Map<String, String>,
  createdAt: Date (default: Date.now),
  updatedAt: Date (default: Date.now)
}
```

**Indexes:**
- `assetTag`: unique
- `serialNumber`: unique, sparse
- `category`: index
- `assignedTo`: index
- `status`: index

**Pre-save Hook:**
- Auto-generates assetTag if not provided: `AST-XXXXXX`
- Updates `updatedAt` on save

---

### Assignments Collection

```javascript
{
  _id: ObjectId,
  asset: ObjectId (ref: 'Asset', required),
  assignedTo: ObjectId (ref: 'User', required),
  assignedBy: ObjectId (ref: 'User', required),
  assignedDate: Date (required, default: Date.now),
  returnDate: Date,
  expectedReturnDate: Date,
  condition: String (enum: ['Excellent', 'Good', 'Fair', 'Poor'], default: 'Good'),
  notes: String,
  status: String (enum: ['Active', 'Returned', 'Lost', 'Damaged'], default: 'Active')
}
```

**Indexes:**
- `asset`: index
- `assignedTo`: index
- `status`: index

---

### Maintenance Collection

```javascript
{
  _id: ObjectId,
  asset: ObjectId (ref: 'Asset', required),
  maintenanceType: String (enum: ['Repair', 'Preventive', 'Upgrade', 'Inspection'], required),
  description: String (required),
  performedBy: String,
  vendor: ObjectId (ref: 'Vendor'),
  cost: Number,
  startDate: Date (default: Date.now),
  endDate: Date,
  status: String (enum: ['Scheduled', 'In Progress', 'Completed', 'Cancelled'], default: 'Scheduled'),
  notes: String,
  nextMaintenanceDate: Date,
  createdAt: Date (default: Date.now)
}
```

**Indexes:**
- `asset`: index
- `status`: index
- `startDate`: index

---

### Licenses Collection

```javascript
{
  _id: ObjectId,
  licenseKey: String (required, unique),
  softwareName: String (required),
  vendor: ObjectId (ref: 'Vendor'),
  licenseType: String (enum: ['Perpetual', 'Subscription', 'Open Source', 'Trial'], required),
  purchaseDate: Date,
  expiryDate: Date,
  cost: Number,
  seats: Number (default: 1),
  usedSeats: Number (default: 0),
  assignedTo: [{
    user: ObjectId (ref: 'User'),
    assignedDate: Date (default: Date.now)
  }],
  status: String (enum: ['Active', 'Expired', 'Suspended', 'Unused'], default: 'Active'),
  notes: String,
  createdAt: Date (default: Date.now)
}
```

**Indexes:**
- `licenseKey`: unique
- `status`: index
- `expiryDate`: index

---

## Relationships

### One-to-Many Relationships

1. **Category → Assets**: One category can have many assets
2. **Vendor → Assets**: One vendor can supply many assets
3. **Vendor → Maintenance**: One vendor can perform many maintenance records
4. **Vendor → Licenses**: One vendor can provide many licenses
5. **User → Assets (assignedTo)**: One user can have many assigned assets
6. **User → Assignments (assignedTo)**: One user can have many assignments
7. **User → Assignments (assignedBy)**: One user can create many assignments
8. **Asset → Assignments**: One asset can have many assignment records
9. **Asset → Maintenance**: One asset can have many maintenance records

### Many-to-Many Relationships

1. **License → User**: Many licenses can be assigned to many users (through `assignedTo` array)

---

## Data Validation

### User Validation
- Email must be valid format
- Password minimum 6 characters
- Role must be one of: Admin, IT Staff, Employee

### Asset Validation
- Asset tag must be unique
- Serial number must be unique (if provided)
- Status must be one of: In Use, In Stock, Under Repair, Retired
- Category reference must exist

### Assignment Validation
- Asset reference must exist
- User references (assignedTo, assignedBy) must exist
- Condition must be one of: Excellent, Good, Fair, Poor
- Status must be one of: Active, Returned, Lost, Damaged

### Maintenance Validation
- Asset reference must exist
- Maintenance type must be one of: Repair, Preventive, Upgrade, Inspection
- Status must be one of: Scheduled, In Progress, Completed, Cancelled

### License Validation
- License key must be unique
- License type must be one of: Perpetual, Subscription, Open Source, Trial
- Status must be one of: Active, Expired, Suspended, Unused
- `usedSeats` cannot exceed `seats`

---

## Sample Data

### Sample Category
```json
{
  "name": "Laptop",
  "description": "Portable computers"
}
```

### Sample Vendor
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

### Sample Asset
```json
{
  "assetTag": "AST-000001",
  "name": "Dell Latitude 5520",
  "category": ObjectId("..."),
  "brand": "Dell",
  "model": "Latitude 5520",
  "serialNumber": "SN123456",
  "status": "In Use",
  "location": "Office A",
  "purchaseDate": ISODate("2023-01-15"),
  "purchasePrice": 1200,
  "warrantyExpiry": ISODate("2026-01-15"),
  "vendor": ObjectId("..."),
  "assignedTo": ObjectId("..."),
  "assignedDate": ISODate("2023-02-01")
}
```

---

## Database Indexes Summary

For optimal performance, the following indexes are recommended:

1. **Users**: `email` (unique)
2. **Categories**: `name` (unique)
3. **Assets**: 
   - `assetTag` (unique)
   - `serialNumber` (unique, sparse)
   - `category`
   - `assignedTo`
   - `status`
4. **Assignments**:
   - `asset`
   - `assignedTo`
   - `status`
5. **Maintenance**:
   - `asset`
   - `status`
   - `startDate`
6. **Licenses**:
   - `licenseKey` (unique)
   - `status`
   - `expiryDate`

---

## Migration Notes

When setting up the database:

1. Create indexes after initial data load
2. Ensure MongoDB version 4.4+ for optimal performance
3. Use connection pooling for better performance
4. Consider sharding for large datasets
5. Regular backups recommended
