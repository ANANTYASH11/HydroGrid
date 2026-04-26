const { query } = require('./server/config/db');
require('dotenv').config();

async function checkSchema() {
  try {
    const res = await query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'usage_data'");
    console.log(JSON.stringify(res.rows, null, 2));
  } catch (err) {
    console.error(err);
  } finally {
    process.exit();
  }
}

checkSchema();
