const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  username: String,
  role: String,
  firstName: String,
  lastName: String
});

const User = mongoose.model('User', UserSchema);

async function checkUsers() {
  try {
    await mongoose.connect('mongodb://localhost:27017/mrt-system');
    console.log('Connected to MongoDB');
    
    const users = await User.find({username: {$in: ['pass001', 'pass002', 'pass003']}});
    console.log('Found users:', users.map(u => ({
      username: u.username,
      firstName: u.firstName,
      role: u.role
    })));
    
    const allUsers = await User.find({});
    console.log('Total users in database:', allUsers.length);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

checkUsers();