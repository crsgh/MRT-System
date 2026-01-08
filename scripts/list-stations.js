const mongoose = require('mongoose');

async function listStations() {
  try {
    await mongoose.connect('mongodb://localhost:27017/mrt-system');
    console.log('Connected to MongoDB');
    
    const stations = await mongoose.connection.db.collection('stations').find({}).toArray();
    
    console.log('\nFound Stations:');
    stations.forEach((s, i) => {
      console.log(`${i+1}. ${s.name} (ID: ${s._id})`);
    });
    console.log(`\nTotal: ${stations.length} stations`);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

listStations();