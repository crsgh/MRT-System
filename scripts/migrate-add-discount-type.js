const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/mrt-system';

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: String,
  role: { type: String, enum: ['passenger', 'admin', 'super_admin'], default: 'passenger' },
  discountType: { type: String, enum: ['none', 'senior', 'pwd', 'student'], default: 'none' },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

const User = mongoose.models?.User || mongoose.model('User', UserSchema);

async function addDiscountTypeToExistingUsers() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Find all passengers (users with role 'passenger')
    const passengers = await User.find({ role: 'passenger' });
    console.log(`Found ${passengers.length} existing passengers`);

    let updatedCount = 0;

    for (const passenger of passengers) {
      // Only update if discountType doesn't exist or is undefined
      if (!passenger.discountType) {
        await User.updateOne(
          { _id: passenger._id },
          { $set: { discountType: 'none' } }
        );
        console.log(`Updated passenger: ${passenger.username} - added discountType: 'none'`);
        updatedCount++;
      } else {
        console.log(`Passenger ${passenger.username} already has discountType: ${passenger.discountType}`);
      }
    }

    console.log(`\nMigration completed! Updated ${updatedCount} passengers.`);
    
    // Show some examples of how to manually set discount types
    console.log('\n--- Manual Discount Type Assignment Examples ---');
    console.log('To manually set discount types for specific passengers, you can use:');
    console.log('');
    console.log('For Senior Citizens:');
    console.log('db.users.updateOne({username: "username_here"}, {$set: {discountType: "senior"}})');
    console.log('');
    console.log('For PWD (Person with Disability):');
    console.log('db.users.updateOne({username: "username_here"}, {$set: {discountType: "pwd"}})');
    console.log('');
    console.log('For Students:');
    console.log('db.users.updateOne({username: "username_here"}, {$set: {discountType: "student"}})');
    console.log('');
    console.log('For Regular passengers:');
    console.log('db.users.updateOne({username: "username_here"}, {$set: {discountType: "none"}})');

  } catch (error) {
    console.error('Error during migration:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

addDiscountTypeToExistingUsers();