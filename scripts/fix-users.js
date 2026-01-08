const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env.local') });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('Please define the MONGODB_URI environment variable inside .env.local');
  process.exit(1);
}

// Define the schema as it is in the application to ensure we can interact with it correctly
const UserSchema = new mongoose.Schema({
  username: String,
  role: String,
  isActive: { type: Boolean, default: true },
});

const User = mongoose.models.User || mongoose.model('User', UserSchema);

async function fixUsers() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Update all users that don't have isActive field or where it is false (if you want to reset them)
    // Here we specifically want to set isActive: true for anyone missing it.
    const result = await User.updateMany(
      { isActive: { $exists: false } },
      { $set: { isActive: true } }
    );

    console.log(`Updated ${result.modifiedCount} users to have isActive: true`);

    // Force update admin user to super_admin to ensure they have full access
    const adminUpdate = await User.updateOne(
        { username: 'admin' },
        { $set: { role: 'super_admin', isActive: true } } 
    );
    
    if (adminUpdate.modifiedCount > 0) {
        console.log('Updated admin user role to super_admin');
    } else {
        console.log('Admin user not found or already super_admin');
    }

    // Generic fallback for others
    const roleUpdate = await User.updateMany(
      { role: { $exists: false } },
      { $set: { role: 'passenger' } }
    );
    
    console.log(`Updated ${roleUpdate.modifiedCount} users with missing roles to passenger`);

    mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  } catch (error) {
    console.error('Error fixing users:', error);
    process.exit(1);
  }
}

fixUsers();