const mongoose = require('mongoose');

const StationSchema = new mongoose.Schema({
  name: String,
  location: Object
});

const Station = mongoose.model('Station', StationSchema);

async function checkStations() {
  try {
    await mongoose.connect('mongodb://localhost:27017/mrt-system');
    console.log('Connected to MongoDB');
    
    const stations = await Station.find({});
    console.log('Found stations:', stations.map(s => ({
      id: s._id,
      name: s.name
    })));
    console.log('Total stations:', stations.length);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

checkStations();