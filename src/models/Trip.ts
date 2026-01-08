import mongoose from 'mongoose';

const tripSchema = new mongoose.Schema({
  passengerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  passengerCode: {
    type: String,
    required: true
  },
  startStation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Station',
    required: true
  },
  endStation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Station',
    default: null
  },
  tapInTime: {
    type: Date,
    required: true,
    default: Date.now
  },
  tapOutTime: {
    type: Date,
    default: null
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'cancelled'],
    default: 'active'
  },
  fare: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

tripSchema.index({ passengerId: 1 });
tripSchema.index({ passengerCode: 1 });
tripSchema.index({ status: 1 });
tripSchema.index({ tapInTime: 1 });

export default mongoose.models?.Trip || mongoose.model('Trip', tripSchema);