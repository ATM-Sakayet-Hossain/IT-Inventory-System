/**
 * Setup Script: Create Users with Different Permission Levels
 * 
 * This script demonstrates how to create users with different
 * permission levels for the Reports & Analytics module.
 * 
 * Usage: node setupPermissions.js
 */

const mongoose = require('mongoose');
const User = require('../models/User');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;

db.on('connected', () => {
  console.log('✅ Connected to MongoDB');
});

db.on('error', (err) => {
  console.error('❌ MongoDB connection error:', err);
  process.exit(1);
});

// Define default permissions for each role
const defaultPermissions = {
  Admin: {
    modules: {
      dashboard: true,
      assets: true,
      users: true,
      categories: true,
      vendors: true,
      assignments: true,
      maintenance: true,
      licenses: true,
      reports: true,  // ✅ Admin CAN access reports
    },
    actions: {
      canCreate: true,
      canRead: true,
      canUpdate: true,
      canDelete: true,
      canApprove: true,
    },
    resources: {
      canManageUsers: true,
      canManageVendors: true,
      canManageAssets: true,
      canViewReports: true,  // ✅ Admin CAN view reports
      canApproveRequests: true,
    },
  },
  'IT Staff - No Reports': {
    modules: {
      dashboard: true,
      assets: true,
      users: false,
      categories: true,
      vendors: false,
      assignments: true,
      maintenance: true,
      licenses: true,
      reports: true,  // ✅ ALL users can access reports
    },
    actions: {
      canCreate: true,
      canRead: true,
      canUpdate: true,
      canDelete: false,
      canApprove: false,
    },
    resources: {
      canManageUsers: false,
      canManageVendors: false,
      canManageAssets: true,
      canViewReports: true,  // ✅ ALL users can view reports
      canApproveRequests: false,
    },
  },
  'IT Staff - With Reports': {
    modules: {
      dashboard: true,
      assets: true,
      users: false,
      categories: true,
      vendors: false,
      assignments: true,
      maintenance: true,
      licenses: true,
      reports: true,  // ✅ Has access to reports
    },
    actions: {
      canCreate: true,
      canRead: true,
      canUpdate: true,
      canDelete: false,
      canApprove: false,
    },
    resources: {
      canManageUsers: false,
      canManageVendors: false,
      canManageAssets: true,
      canViewReports: true,  // ✅ Can view reports
      canApproveRequests: false,
    },
  },
  Employee: {
    modules: {
      dashboard: false,
      assets: false,
      users: false,
      categories: false,
      vendors: false,
      assignments: false,
      maintenance: true,  // Only maintenance access
      licenses: false,
      reports: true,  // ✅ ALL users can access reports
    },
    actions: {
      canCreate: false,
      canRead: true,
      canUpdate: false,
      canDelete: false,
      canApprove: false,
    },
    resources: {
      canManageUsers: false,
      canManageVendors: false,
      canManageAssets: false,
      canViewReports: true,  // ✅ ALL users can view reports
      canApproveRequests: false,
    },
  },
};

// Users to create for testing
const testUsers = [
  {
    name: 'Admin User',
    email: 'admin.test@company.com',
    password: 'AdminPass123!',
    role: 'Admin',
    permissionProfile: 'Admin',
    description: 'Has full access to all modules including Reports'
  },
  {
    name: 'IT Staff - Reports Access',
    email: 'itstaff.reports@company.com',
    password: 'ITPass123!',
    role: 'IT Staff',
    permissionProfile: 'IT Staff - With Reports',
    description: 'Can access Reports & Analytics'
  },
  {
    name: 'IT Staff - No Reports',
    email: 'itstaff.noreports@company.com',
    password: 'ITPass123!',
    role: 'IT Staff',
    permissionProfile: 'IT Staff - No Reports',
    description: 'CANNOT access Reports & Analytics'
  },
  {
    name: 'Employee User',
    email: 'employee.test@company.com',
    password: 'EmployeePass123!',
    role: 'Employee',
    permissionProfile: 'Employee',
    description: 'Only has Maintenance access'
  },
];

async function setupPermissions() {
  try {
    console.log('\n📋 Starting Permission Setup...\n');

    // Delete existing test users
    console.log('🗑️  Cleaning up existing test users...');
    const emails = testUsers.map(u => u.email);
    await User.deleteMany({ email: { $in: emails } });
    console.log('   ✅ Cleaned up existing users\n');

    // Create new test users
    console.log('👥 Creating test users with permissions...\n');

    for (const testUser of testUsers) {
      const permissions = defaultPermissions[testUser.permissionProfile];

      const user = await User.create({
        name: testUser.name,
        email: testUser.email,
        password: testUser.password,
        role: testUser.role,
        permissions: permissions,
        isActive: true,
        isValid: true,
      });

      console.log(`✅ Created: ${testUser.name}`);
      console.log(`   📧 Email: ${testUser.email}`);
      console.log(`   🎭 Role: ${testUser.role}`);
      console.log(`   📍 Description: ${testUser.description}`);
      console.log(`   📊 Reports Access: ${permissions.modules.reports ? '✅ YES' : '❌ NO'}`);
      console.log(`   👁️  Can View Reports: ${permissions.resources.canViewReports ? '✅ YES' : '❌ NO'}`);
      console.log('');
    }

    console.log('═══════════════════════════════════════════════════════════════\n');
    console.log('🎉 PERMISSION SETUP COMPLETE!\n');

    console.log('📖 TEST CREDENTIALS:\n');

    console.log('1️⃣  ADMIN (Full Access to Reports)');
    console.log('   Email: admin.test@company.com');
    console.log('   Password: AdminPass123!');
    console.log('   Expected: ✅ Can see and access Reports menu\n');

    console.log('2️⃣  IT STAFF - WITH REPORTS (Can Access Reports)');
    console.log('   Email: itstaff.reports@company.com');
    console.log('   Password: ITPass123!');
    console.log('   Expected: ✅ Can see and access Reports menu\n');

    console.log('3️⃣  IT STAFF - NO REPORTS (Cannot Access Reports)');
    console.log('   Email: itstaff.noreports@company.com');
    console.log('   Password: ITPass123!');
    console.log('   Expected: ❌ Reports menu hidden, API returns 403\n');

    console.log('4️⃣  EMPLOYEE (No Reports Access)');
    console.log('   Email: employee.test@company.com');
    console.log('   Password: EmployeePass123!');
    console.log('   Expected: ❌ Reports menu hidden, only Maintenance visible\n');

    console.log('═══════════════════════════════════════════════════════════════\n');

    console.log('🧪 TESTING CHECKLIST:\n');
    console.log('[ ] Login with each user and verify menu items');
    console.log('[ ] Try accessing /reports route for each user');
    console.log('[ ] Try calling GET /api/reports/dashboard for each user');
    console.log('[ ] Verify 403 Forbidden error for users without permission');
    console.log('[ ] Check browser console for permission errors\n');

    console.log('═══════════════════════════════════════════════════════════════\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error setting up permissions:', error);
    process.exit(1);
  }
}

// Run setup
setupPermissions();
