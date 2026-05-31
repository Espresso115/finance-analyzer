import mongoose from 'mongoose';

const FinancialDataSchema = new mongoose.Schema(
  {
    symbol: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
      index: true
    },
    assetType: {
      type: String,
      enum: ['stock', 'crypto', 'forex'],
      required: true,
      index: true
    },
    price: {
      type: Number,
      required: true
    },
    change: {
      type: Number,
      default: 0
    },
    changePercent: {
      type: Number,
      default: 0
    },
    volume: {
      type: Number,
      default: 0
    },
    source: {
      type: String,
      default: 'mock-provider'
    },
    observedAt: {
      type: Date,
      default: Date.now,
      index: true
    }
  },
  {
    timestamps: true
  }
);

FinancialDataSchema.index({ symbol: 1, observedAt: -1 });

const FinancialData = mongoose.model('FinancialData', FinancialDataSchema);

export default FinancialData;
