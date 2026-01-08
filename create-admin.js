import dbConnect from '../src/lib/db.js';
import User from '../src/models/User.js';
import bcrypt from 'bcryptjs';
import { UserRole } from '../src/types/auth.js';

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