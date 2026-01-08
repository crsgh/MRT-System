const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

const StationSchema = new mongoose.Schema({
  name: { type: String, required: true },
  code: { type: String, required: true, unique: true },
  latitude: { type: Number, required: true },
  longitude: { type: Number, required: true },
  description: { type: String },
  order: { type: Number, required: true, unique: true },
}, { timestamps: true });

const Station = mongoose.models.Station || mongoose.model('Station', StationSchema);

const stations = [
  {
    name: "North Avenue",
    code: "MRT3_NORTH_AVENUE",
    latitude: 14.6521,
    longitude: 121.0323,
    description: "Northern terminus of the MRT Line 3 located in Quezon City.",
    order: 1
  },
  {
    name: "Quezon Avenue",
    code: "MRT3_QUEZON_AVENUE",
    latitude: 14.6425,
    longitude: 121.0385,
    description: "Located at the intersection of EDSA and Quezon Avenue.",
    order: 2
  },
  {
    name: "Kamuning",
    code: "MRT3_KAMUNING",
    latitude: 14.6297,
    longitude: 121.0416,
    description: "Also known as GMA-Kamuning station.",
    order: 3
  },
  {
    name: "Araneta Center-Cubao",
    code: "MRT3_CUBAO",
    latitude: 14.6195,
    longitude: 121.0511,
    description: "Major transfer point to LRT Line 2.",
    order: 4
  },
  {
    name: "Santolan-Annapolis",
    code: "MRT3_SANTOLAN",
    latitude: 14.6081,
    longitude: 121.0563,
    description: "Located between Santolan Road and Annapolis Street.",
    order: 5
  },
  {
    name: "Ortigas",
    code: "MRT3_ORTIGAS",
    latitude: 14.5878,
    longitude: 121.0567,
    description: "Located in the Ortigas Center business district.",
    order: 6
  },
  {
    name: "Shaw Boulevard",
    code: "MRT3_SHAW",
    latitude: 14.5812,
    longitude: 121.0536,
    description: "Located in the Shaw Boulevard area of Mandaluyong.",
    order: 7
  },
  {
    name: "Boni",
    code: "MRT3_BONI",
    latitude: 14.5736,
    longitude: 121.0483,
    description: "Located near Boni Avenue in Mandaluyong.",
    order: 8
  },
  {
    name: "Guadalupe",
    code: "MRT3_GUADALUPE",
    latitude: 14.5673,
    longitude: 121.0457,
    description: "Located near the Guadalupe Bridge and Pasig River.",
    order: 9
  },
  {
    name: "Buendia",
    code: "MRT3_BUENDIA",
    latitude: 14.5542,
    longitude: 121.0336,
    description: "Located at the intersection of EDSA and Gil Puyat Avenue (Buendia).",
    order: 10
  },
  {
    name: "Ayala",
    code: "MRT3_AYALA",
    latitude: 14.5493,
    longitude: 121.0279,
    description: "Located in the Makati Central Business District.",
    order: 11
  },
  {
    name: "Magallanes",
    code: "MRT3_MAGALLANES",
    latitude: 14.5420,
    longitude: 121.0195,
    description: "Located at the Magallanes Interchange in Makati.",
    order: 12
  },
  {
    name: "Taft Avenue",
    code: "MRT3_TAFT",
    latitude: 14.5376,
    longitude: 121.0023,
    description: "Southern terminus, transfer point to LRT Line 1.",
    order: 13
  }
];

async function seedStations() {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI is not defined in .env.local');
    }

    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing stations to avoid duplicates
    await Station.deleteMany({});
    console.log('Cleared existing stations');

    // Insert new stations
    await Station.insertMany(stations);
    console.log(`Successfully seeded ${stations.length} stations`);

    mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  } catch (error) {
    console.error('Error seeding stations:', error);
    process.exit(1);
  }
}

seedStations();