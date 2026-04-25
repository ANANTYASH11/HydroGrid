const mongoose = require('mongoose');

const TariffSlabSchema = new mongoose.Schema({
  upto: {
    type: Number,
    required: true,
    description: 'The upper limit of the slab. Use -1 to represent Infinity.'
  },
  rate: {
    type: Number,
    required: true,
    description: 'The cost per unit within this slab.'
  }
});

const TariffDataSchema = new mongoose.Schema({
  state: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    description: 'The state key, e.g., delhi, maharashtra, default'
  },
  electricity: [TariffSlabSchema],
  water: [TariffSlabSchema]
}, { timestamps: true });

// Convert -1 back to Infinity when retrieving
TariffDataSchema.methods.getSlabsWithInfinity = function() {
  const processSlabs = (slabs) => {
    return slabs.map(slab => ({
      upto: slab.upto === -1 ? Infinity : slab.upto,
      rate: slab.rate
    }));
  };

  return {
    state: this.state,
    electricity: processSlabs(this.electricity),
    water: processSlabs(this.water)
  };
};

module.exports = mongoose.model('TariffData', TariffDataSchema);
