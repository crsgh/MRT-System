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

async function setDiscountType() {
  const args = process.argv.slice(2);
  
  if (args.length !== 2) {
    console.log('Usage: node scripts/set-discount-type.js <username> <discount_type>');
    console.log('');
    console.log('Examples:');
    console.log('  node scripts/set-discount-type.js crsmrt senior');
    console.log('  node scripts/set-discount-type.js crsmrt pwd');
    console.log('  node scripts/set-discount-type.js crsmrt student');
    console.log('  node scripts/set-discount-type.js crsmrt none');
    process.exit(1);
  }

  const [username, discountType] = args;
  
  if (!['none', 'senior', 'pwd', 'student'].includes(discountType)) {
    console.log('Error: Invalid discount type. Must be one of: none, senior, pwd, student');
    process.exit(1);
  }

  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    const user = await User.findOneAndUpdate(
      { username, role: 'passenger' },
      { $set: { discountType } },
      { new: true }
    );

    if (!user) {
      console.log(`Error: Passenger with username "${username}" not found`);
    } else {
      console.log(`✅ Successfully updated ${username}:`);
      console.log(`   Name: ${user.firstName} ${user.lastName}`);
      console.log(`   Discount Type: ${discountType}`);
      console.log(`   Expected Discount: ${discountType === 'none' ? 'Regular fare' : '50% off regular fare'}`);
    }

  } catch (error) {
    console.error('Error updating discount type:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

setDiscountType();