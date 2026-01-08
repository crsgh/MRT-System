const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Simple enum for UserRole
const UserRole = {
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin',
  PASSENGER: 'passenger'
};

// Database connection
async function dbConnect() {
  if (mongoose.connections[0].readyState) {
    return;
  }
  
  const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/mrt-system';
  await mongoose.connect(mongoUri);
}

// User schema
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String },
  firstName: { type: String },
  lastName: { type: String },
  password: { type: String, required: true },
  role: { type: String, enum: Object.values(UserRole), default: UserRole.PASSENGER },
  isActive: { type: Boolean, default: true },
  lastLogin: { type: Date },
}, { timestamps: true });

const User = mongoose.models.User || mongoose.model('User', userSchema);

async function createAdminUser() {
  try {
    await dbConnect();
    
    // Check if admin user already exists
    const existingAdmin = await User.findOne({ username: 'admin' });
    if (existingAdmin) {
      console.log('Admin user already exists:', {
        username: existingAdmin.username,
        role: existingAdmin.role,
        isActive: existingAdmin.isActive
      });
      
      // Update to ensure it's super_admin and active
      await User.findByIdAndUpdate(existingAdmin._id, {
        role: UserRole.SUPER_ADMIN,
        isActive: true
      });
      console.log('Updated admin user to super_admin and active');
      return;
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash('password123', 12);
    
    // Create super admin user
    const adminUser = new User({
      username: 'admin',
      email: 'admin@mrt.com',
      firstName: 'System',
      lastName: 'Administrator',
      password: hashedPassword,
      role: UserRole.SUPER_ADMIN,
      isActive: true,
    });
    
    await adminUser.save();
    console.log('Super admin user created successfully:', {
      username: adminUser.username,
      role: adminUser.role,
      isActive: adminUser.isActive
    });
    
  } catch (error) {
    console.error('Error creating admin user:', error);
  } finally {
    process.exit(0);
  }
}

createAdminUser();