const mongoose = require('mongoose');
const TariffData = require('./models/TariffData');
require('dotenv').config({ path: './.env' });

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/hydrogrid';

const tariffData = {
  "default": {
    "electricity": [{ "upto": 100, "rate": 4.0 }, { "upto": 300, "rate": 6.5 }, { "upto": -1, "rate": 8.0 }],
    "water": [{ "upto": 10000, "rate": 0.03 }, { "upto": -1, "rate": 0.08 }]
  },
  "delhi": {
    "electricity": [{ "upto": 200, "rate": 3.0 }, { "upto": 400, "rate": 4.5 }, { "upto": 800, "rate": 6.5 }, { "upto": -1, "rate": 8.0 }],
    "water": [{ "upto": 20000, "rate": 0.00 }, { "upto": 30000, "rate": 0.05 }, { "upto": -1, "rate": 0.08 }]
  },
  "maharashtra": {
    "electricity": [{ "upto": 100, "rate": 4.7 }, { "upto": 300, "rate": 8.9 }, { "upto": 500, "rate": 12.0 }, { "upto": -1, "rate": 14.5 }],
    "water": [{ "upto": 15000, "rate": 0.04 }, { "upto": -1, "rate": 0.09 }]
  },
  "karnataka": {
    "electricity": [{ "upto": 200, "rate": 0.0 }, { "upto": 300, "rate": 7.0 }, { "upto": -1, "rate": 8.5 }],
    "water": [{ "upto": 10000, "rate": 0.03 }, { "upto": 25000, "rate": 0.05 }, { "upto": -1, "rate": 0.08 }]
  },
  "gujarat": {
    "electricity": [{ "upto": 50, "rate": 3.05 }, { "upto": 200, "rate": 3.50 }, { "upto": 250, "rate": 4.15 }, { "upto": -1, "rate": 5.20 }],
    "water": [{ "upto": 15000, "rate": 0.02 }, { "upto": -1, "rate": 0.06 }]
  },
  "tamil_nadu": {
    "electricity": [{ "upto": 100, "rate": 0.0 }, { "upto": 200, "rate": 2.25 }, { "upto": 400, "rate": 4.50 }, { "upto": -1, "rate": 6.00 }],
    "water": [{ "upto": 20000, "rate": 0.03 }, { "upto": -1, "rate": 0.07 }]
  },
  "uttar_pradesh": {
    "electricity": [{ "upto": 150, "rate": 5.50 }, { "upto": 300, "rate": 6.00 }, { "upto": 500, "rate": 6.50 }, { "upto": -1, "rate": 7.00 }],
    "water": [{ "upto": -1, "rate": 0.05 }]
  },
  "west_bengal": {
    "electricity": [{ "upto": 102, "rate": 5.26 }, { "upto": 180, "rate": 6.16 }, { "upto": -1, "rate": 7.12 }],
    "water": [{ "upto": -1, "rate": 0.04 }]
  },
  "punjab": {
    "electricity": [{ "upto": 300, "rate": 0.0 }, { "upto": -1, "rate": 7.50 }],
    "water": [{ "upto": -1, "rate": 0.00 }] // Often subsidized/free rural water
  },
  "haryana": {
    "electricity": [{ "upto": 200, "rate": 2.50 }, { "upto": 400, "rate": 5.25 }, { "upto": -1, "rate": 7.00 }],
    "water": [{ "upto": -1, "rate": 0.04 }]
  },
  "rajasthan": {
    "electricity": [{ "upto": 100, "rate": 0.0 }, { "upto": 300, "rate": 6.50 }, { "upto": 500, "rate": 7.00 }, { "upto": -1, "rate": 7.50 }],
    "water": [{ "upto": 15000, "rate": 0.03 }, { "upto": -1, "rate": 0.07 }]
  }
};

async function seed() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    let count = 0;
    for (const [stateKey, data] of Object.entries(tariffData)) {
      const record = {
        state: stateKey.toLowerCase(),
        electricity: data.electricity,
        water: data.water
      };
      await TariffData.findOneAndReplace({ state: record.state }, record, { upsert: true });
      count++;
    }

    console.log(`Successfully seeded ${count} states into the database.`);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

seed();
