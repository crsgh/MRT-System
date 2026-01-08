const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

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

async function createTestPassengers() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    const testPassengers = [
      {
        username: 'pass001',
        password: await bcrypt.hash('password123', 10),
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        role: 'passenger',
        discountType: 'none',
        isActive: true
      },
      {
        username: 'pass002',
        password: await bcrypt.hash('password123', 10),
        firstName: 'Maria',
        lastName: 'Santos',
        email: 'maria.santos@example.com',
        role: 'passenger',
        discountType: 'senior',
        isActive: true
      },
      {
        username: 'pass003',
        password: await bcrypt.hash('password123', 10),
        firstName: 'Alex',
        lastName: 'Rivera',
        email: 'alex.rivera@example.com',
        role: 'passenger',
        discountType: 'student',
        isActive: true
      },
      {
        username: 'pass004',
        password: await bcrypt.hash('password123', 10),
        firstName: 'Jose',
        lastName: 'Cruz',
        email: 'jose.cruz@example.com',
        role: 'passenger',
        discountType: 'pwd',
        isActive: true
      },
      {
        username: 'pass005',
        password: await bcrypt.hash('password123', 10),
        firstName: 'Anna',
        lastName: 'Garcia',
        email: 'anna.garcia@example.com',
        role: 'passenger',
        discountType: 'student',
        isActive: true
      },
      {
        username: 'crsmrt',
        password: await bcrypt.hash('password123', 10),
        firstName: 'Carlos',
        lastName: 'Miranda',
        email: 'carlos.miranda@example.com',
        role: 'passenger',
        discountType: 'none',
        isActive: true
      }
    ];

    for (const passenger of testPassengers) {
      const existingUser = await User.findOne({ username: passenger.username });
      
      if (existingUser) {
        console.log(`User ${passenger.username} already exists, skipping...`);
        continue;
      }

      await User.create(passenger);
      console.log(`Created test passenger: ${passenger.username} (${passenger.firstName} ${passenger.lastName})`);
    }

    console.log('Test passengers created successfully!');
    console.log('\nYou can now test with these passenger codes:');
    testPassengers.forEach(p => {
      const discountLabel = p.discountType !== 'none' ? ` [${p.discountType.toUpperCase()} - 50% discount]` : ' [Regular fare]';
      console.log(`- ${p.username}: ${p.firstName} ${p.lastName}${discountLabel}`);
    });

  } catch (error) {
    console.error('Error creating test passengers:', error);
  } finally {
    await mongoose.disconnect();
  }
}

createTestPassengers();