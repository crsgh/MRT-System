import { Schema, model, models } from 'mongoose';

const StationSchema = new Schema({
  name: {
    type: String,
    required: [true, 'Please provide a station name'],
  },
  code: {
    type: String,
    required: [true, 'Please provide a station code'],
    unique: true,
  },
  latitude: {
    type: Number,
    required: [true, 'Please provide latitude'],
  },
  longitude: {
    type: Number,
    required: [true, 'Please provide longitude'],
  },
  description: {
    type: String,
  },
  order: {
    type: Number,
    required: [true, 'Please provide station order'],
    unique: true,
  },
}, { timestamps: true });

const Station = models.Station || model('Station', StationSchema);

export default Station;
