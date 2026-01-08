import dbConnect from '../src/lib/db.js';
import User from '../src/models/User.js';

async function checkUser() {
  try {
    await dbConnect();
    const user = await User.findOne({ username: 'admin' });
    
    if (user) {
      console.log('User found:', {
        id: user._id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        isActive: user.isActive,
        createdAt: user.createdAt
      });
    } else {
      console.log('User not found');
      
      // Show all users
      const allUsers = await User.find({});
      console.log('All users:', allUsers.map(u => ({
        username: u.username,
        role: u.role,
        isActive: u.isActive
      })));
    }
  } catch (error) {
    console.error('Error:', error);
  }
  process.exit(0);
}

checkUser();