import mongoose from 'mongoose';

const walletTransactionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  amount: {
    type: Number,
    required: true,
    min: 0,
  },
  method: {
    type: String,
    default: 'unknown',
  },
  status: {
    type: String,
    default: 'paid',
  },
  paymentId: {
    type: String,
    unique: true,
    sparse: true,
  },
  sourceId: {
    type: String,
  },
}, {
  timestamps: true,
});

walletTransactionSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.models?.WalletTransaction || mongoose.model('WalletTransaction', walletTransactionSchema);
