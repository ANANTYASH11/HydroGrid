/**
 * Usage Controller (Supabase/Postgres version)
 * Handles CRUD operations for water/electricity usage data using Raw SQL
 */

const { query } = require('../config/db');
const { sendAlertEmail } = require('../utils/emailService');

const INDIA_TARIFFS = {
  default: {
    electricity: [
      { upto: 100, rate: 4.0 },
      { upto: 300, rate: 6.5 },
      { upto: Infinity, rate: 8.0 },
    ],
    water: [
      { upto: 10000, rate: 0.03 },
      { upto: 25000, rate: 0.05 },
      { upto: Infinity, rate: 0.08 },
    ],
  },
  maharashtra: {
    electricity: [
      { upto: 100, rate: 4.2 },
      { upto: 300, rate: 7.2 },
      { upto: Infinity, rate: 9.1 },
    ],
    water: [
      { upto: 10000, rate: 0.03 },
      { upto: 25000, rate: 0.06 },
      { upto: Infinity, rate: 0.09 },
    ],
  },
  delhi: {
    electricity: [
      { upto: 200, rate: 3.0 },
      { upto: 400, rate: 6.8 },
      { upto: Infinity, rate: 8.5 },
    ],
    water: [
      { upto: 10000, rate: 0.02 },
      { upto: 25000, rate: 0.05 },
      { upto: Infinity, rate: 0.08 },
    ],
  },
  karnataka: {
    electricity: [
      { upto: 100, rate: 4.5 },
      { upto: 300, rate: 7.0 },
      { upto: Infinity, rate: 8.8 },
    ],
    water: [
      { upto: 10000, rate: 0.03 },
      { upto: 25000, rate: 0.05 },
      { upto: Infinity, rate: 0.07 },
    ],
  },
};

const addUsage = async (req, res, next) => {
  try {
    const { type, value, source = 'manual' } = req.body;
    const unit = type === 'water' ? 'liters' : 'kWh';
    
    // Calculate cost based on hardcoded rates (simplified for now)
    const cost = type === 'water' ? value * 0.05 : value * 8;

    const result = await query(
      'INSERT INTO usage_data (user_id, state, type, value, unit, cost, source) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [req.user.id, req.user.state, type, value, unit, cost, source]
    );

    const usage = result.rows[0];

    checkAndCreateAlert(req.user, type, value).catch(err => console.error('Alert Error:', err));

    res.status(201).json({ success: true, data: usage });
  } catch (error) {
    next(error);
  }
};

const getUsage = async (req, res, next) => {
  try {
    const { type, startDate, endDate, limit = 100 } = req.query;
    let sql = 'SELECT * FROM usage_data WHERE user_id = $1';
    let params = [req.user.id];
    let count = 2;

    if (type) {
      sql += ` AND type = $${count++}`;
      params.push(type);
    }
    if (startDate) {
      sql += ` AND timestamp >= $${count++}`;
      params.push(new Date(startDate));
    }
    if (endDate) {
      sql += ` AND timestamp <= $${count++}`;
      params.push(new Date(endDate));
    }

    sql += ` ORDER BY timestamp DESC LIMIT $${count}`;
    params.push(parseInt(limit));

    const result = await query(sql, params);

    res.json({
      success: true,
      count: result.rows.length,
      data: result.rows,
    });
  } catch (error) {
    next(error);
  }
};

const getDashboardStats = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

    // This month stats
    const thisMonthRes = await query(
      `SELECT type, SUM(value) as "totalValue", SUM(cost) as "totalCost", AVG(value) as "avgValue" 
       FROM usage_data WHERE user_id = $1 AND timestamp >= $2 GROUP BY type`,
      [userId, thisMonthStart]
    );

    // Last month stats
    const lastMonthRes = await query(
      `SELECT type, SUM(value) as "totalValue", SUM(cost) as "totalCost" 
       FROM usage_data WHERE user_id = $1 AND timestamp >= $2 AND timestamp <= $3 GROUP BY type`,
      [userId, lastMonthStart, lastMonthEnd]
    );

    // Past 7 days (for chart)
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(today.getDate() - 7);
    const dailyRes = await query(
       `SELECT date_trunc('day', timestamp) as date, type, SUM(value) as "totalValue", SUM(cost) as "totalCost"
        FROM usage_data WHERE user_id = $1 AND timestamp >= $2
        GROUP BY date, type ORDER BY date ASC`,
       [userId, sevenDaysAgo]
    );

    // Past 6 months (for chart)
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);
    const monthlyRes = await query(
       `SELECT date_trunc('month', timestamp) as month, type, SUM(value) as "totalValue", SUM(cost) as "totalCost"
        FROM usage_data WHERE user_id = $1 AND timestamp >= $2
        GROUP BY month, type ORDER BY month ASC`,
       [userId, sixMonthsAgo]
    );

    // Process rows to match frontend format
    const formatRows = (rows) => {
        const water = rows.find(r => r.type === 'water') || { totalValue: 0, totalCost: 0, avgValue: 0 };
        const electricity = rows.find(r => r.type === 'electricity') || { totalValue: 0, totalCost: 0, avgValue: 0 };
        return { water, electricity };
    };

    const current = formatRows(thisMonthRes.rows);
    const previous = formatRows(lastMonthRes.rows);
    
    // Map daily data to expected _id format
    const dailyUsage = dailyRes.rows.map(r => ({
        _id: { date: r.date.toISOString().split('T')[0], type: r.type },
        totalValue: parseFloat(r.totalValue),
        totalCost: parseFloat(r.totalCost)
    }));

    const monthlyUsage = monthlyRes.rows.map(r => ({
        _id: { month: r.month.toISOString().slice(0, 7), type: r.type },
        totalValue: parseFloat(r.totalValue),
        totalCost: parseFloat(r.totalCost)
    }));

    const recentAlertsRes = await query('SELECT * FROM alerts WHERE user_id = $1 ORDER BY timestamp DESC LIMIT 5', [userId]);

    res.json({
      success: true,
      data: {
        current,
        previous,
        savings: {
          water: parseFloat((previous.water.totalCost - current.water.totalCost).toFixed(2)),
          electricity: parseFloat((previous.electricity.totalCost - current.electricity.totalCost).toFixed(2)),
          total: parseFloat(((previous.water.totalCost - current.water.totalCost) + (previous.electricity.totalCost - current.electricity.totalCost)).toFixed(2))
        },
        dailyUsage,
        monthlyUsage,
        recentAlerts: recentAlertsRes.rows
      }
    });
  } catch (error) {
    next(error);
  }
};

const simulateIoT = async (req, res, next) => {
  try {
    const { days = 1 } = req.body;
    const now = new Date();
    let totalInserted = 0;

    for (let d = 0; d < Math.min(days, 30); d++) {
      const date = new Date(now);
      date.setDate(date.getDate() - d);

      // Water readings
      const waterCount = Math.floor(Math.random() * 5) + 4;
      for (let i = 0; i < waterCount; i++) {
        const hour = Math.floor(Math.random() * 24);
        const ts = new Date(date);
        ts.setHours(hour, Math.floor(Math.random() * 60));
        let val = 20 + Math.random() * 40;
        if (hour >= 6 && hour <= 9) val *= 1.5;
        await query(
           'INSERT INTO usage_data (user_id, state, type, value, unit, cost, source, timestamp) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
           [req.user.id, req.user.state, 'water', val, 'liters', val * 0.05, 'iot', ts]
        );
        totalInserted++;
      }

      // Electricity readings
      for (let h = 0; h < 24; h++) {
        const ts = new Date(date);
        ts.setHours(h, 0);
        let val = 0.5 + Math.random() * 1;
        if (h >= 18 && h <= 23) val = 2.5 + Math.random() * 3;
        await query(
           'INSERT INTO usage_data (user_id, state, type, value, unit, cost, source, timestamp) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
           [req.user.id, req.user.state, 'electricity', val, 'kWh', val * 8, 'iot', ts]
        );
        totalInserted++;
      }
    }

    res.status(201).json({ success: true, count: totalInserted });
  } catch (error) {
    next(error);
  }
};

const getLeaderboard = async (req, res, next) => {
  try {
    const result = await query(`
      SELECT 
        u.id, u.name, u.avatar, u.badges,
        SUM(CASE WHEN d.type = 'water' THEN d.value ELSE 0 END) as "totalWaterValue",
        SUM(CASE WHEN d.type = 'electricity' THEN d.value ELSE 0 END) as "totalElectricityValue",
        SUM(d.cost) as "totalCost",
        COUNT(d.id) as "readingCount",
        (SUM(d.cost) / NULLIF(COUNT(d.id), 0)) as "efficiencyScore"
      FROM users u
      LEFT JOIN usage_data d ON u.id = d.user_id
      GROUP BY u.id
      ORDER BY "efficiencyScore" ASC NULLS LAST
      LIMIT 10
    `);

    res.json({ success: true, data: result.rows });
  } catch (error) {
    next(error);
  }
};

const getMapStateStats = async (req, res, next) => {
  try {
    const ALL_INDIAN_STATES = [
      'Andaman and Nicobar Islands', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chandigarh', 
      'Chhattisgarh', 'Dadra and Nagar Haveli', 'Daman and Diu', 'Goa', 'Gujarat', 
      'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Lakshadweep', 
      'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 
      'Delhi', 'Puducherry', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 
      'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal', 'Odisha', 'Andhra Pradesh', 
      'Jammu and Kashmir', 'Ladakh'
    ];

    const result = await query(
      'SELECT state, type, AVG(value) as "avgValue" FROM usage_data GROUP BY state, type'
    );

    const formattedData = {};
    const getRegion = (s) => {
      const north = ['Punjab','Haryana','Himachal Pradesh','Jammu and Kashmir','Ladakh','Rajasthan','Chandigarh','Delhi','Uttarakhand','Uttar Pradesh'];
      const south = ['Andhra Pradesh','Karnataka','Kerala','Tamil Nadu','Telangana','Lakshadweep','Daman and Diu'];
      const east  = ['Bihar','Jharkhand','Odisha','West Bengal','Andaman and Nicobar Islands'];
      const west  = ['Goa','Gujarat','Maharashtra','Dadra and Nagar Haveli'];
      const north_east    = ['Arunachal Pradesh','Assam','Manipur','Meghalaya','Mizoram','Nagaland','Sikkim','Tripura'];
      
      if (north.includes(s)) return 'North';
      if (south.includes(s)) return 'South';
      if (east.includes(s)) return 'East';
      if (west.includes(s)) return 'West';
      if (north_east.includes(s)) return 'NE';
      return 'Central';
    };

    ALL_INDIAN_STATES.forEach(state => {
      const baseWater = 80 + Math.random() * 100;
      formattedData[state] = { 
        water: parseFloat(baseWater.toFixed(1)), 
        electricity: parseFloat((2 + Math.random() * 6).toFixed(2)),
        pop: Math.floor(Math.random() * 50) + 1,
        trend: Math.random() > 0.5 ? 'up' : 'down',
        region: getRegion(state),
        alerts: Math.floor(Math.random() * 15),
        renewable: Math.floor(Math.random() * 60) + 10,
        monthly: [70, 85, 90, 80, 95, 100, 80],
        yearly: [800, 850, 900, 950, 1000]
      };
    });

    result.rows.forEach(stat => {
      if (formattedData[stat.state]) {
        if (stat.type === 'water') formattedData[stat.state].water = parseFloat(parseFloat(stat.avgValue).toFixed(1));
        if (stat.type === 'electricity') formattedData[stat.state].electricity = parseFloat(parseFloat(stat.avgValue).toFixed(2));
      }
    });

    res.json({ success: true, data: formattedData });
  } catch (error) {
    next(error);
  }
};

const getCarbonFootprint = async (req, res, next) => {
  try {
    const { period = 'month' } = req.query;
    let startDate = new Date();
    startDate.setDate(1);

    const result = await query(
      'SELECT SUM(value) as "totalKwh" FROM usage_data WHERE user_id = $1 AND type = \'electricity\' AND timestamp >= $2',
      [req.user.id, startDate]
    );

    const totalKwh = parseFloat(result.rows[0]?.totalKwh || 0);
    const carbonKg = parseFloat((totalKwh * 0.42).toFixed(2));

    res.json({
      success: true,
      data: {
        totalKwh,
        carbonKg,
        carbonTons: parseFloat((carbonKg / 1000).toFixed(4)),
        treesNeeded: Math.ceil(carbonKg / 22),
        period
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Utility for alerts
 */
async function checkAndCreateAlert(user, type, value) {
  const threshold = type === 'water' ? user.settings?.waterThreshold || 500 : user.settings?.electricityThreshold || 50;
  if (value <= threshold) return;

  const severity = value > threshold * 1.5 ? 'red' : 'yellow';
  const message = `${severity === 'red' ? '🚨' : '⚠️'} ${type} usage (${value}) exceeds your limit of ${threshold}`;

  const alertRes = await query(
    'INSERT INTO alerts (user_id, type, severity, message, threshold, actual_value) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
    [user.id, type, severity, message, threshold, value]
  );

  sendAlertEmail(user, alertRes.rows[0]).catch(e => console.error('Alert Email Error:', e));
}

const getTariffEstimate = async (req, res, next) => {
  try {
    const stateKey = (req.query.state || 'default').toLowerCase();
    const electricityUnits = Math.max(0, parseFloat(req.query.electricityUnits || 0));
    const waterLiters = Math.max(0, parseFloat(req.query.waterLiters || 0));

    // Try finding exact state from SQL, otherwise fallback to hardcoded
    const tariffRes = await query('SELECT * FROM tariffs WHERE state = $1', [stateKey]);
    let tariffs = INDIA_TARIFFS[stateKey] || INDIA_TARIFFS.default;
    
    if (tariffRes.rows.length > 0) {
      tariffs = {
        electricity: tariffRes.rows[0].electricity,
        water: tariffRes.rows[0].water
      };
    }
    const calculate = (val, slabs) => {
        let total = 0;
        let rem = val;
        let prev = 0;
        for (const s of slabs) {
            const size = s.upto === Infinity ? rem : s.upto - prev;
            const use = Math.min(rem, size);
            total += use * s.rate;
            rem -= use;
            prev = s.upto;
            if (rem <= 0) break;
        }
        return total;
    };

    const electricity = calculate(electricityUnits, tariffs.electricity);
    const water = calculate(waterLiters, tariffs.water);

    res.json({
      success: true,
      data: {
        state: stateKey,
        totalEstimatedBill: parseFloat((electricity + water).toFixed(2)),
        currency: 'INR'
      }
    });
  } catch (error) { next(error); }
};

const getTariffTemplate = (req, res) => {
    res.json(INDIA_TARIFFS);
};

const uploadTariffs = async (req, res) => {
    try {
        const tariffUploadMap = req.body;
        let updatedCount = 0;

        for (const [stateKey, data] of Object.entries(tariffUploadMap)) {
            await query(
                'INSERT INTO tariffs (state, electricity, water, updated_at) VALUES ($1, $2, $3, NOW()) ON CONFLICT (state) DO UPDATE SET electricity = $2, water = $3, updated_at = NOW()',
                [stateKey.toLowerCase(), JSON.stringify(data.electricity), JSON.stringify(data.water)]
            );
            updatedCount++;
        }
        res.json({ success: true, message: `Successfully updated ${updatedCount} state tariffs!` });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
  addUsage,
  getUsage,
  getDashboardStats,
  simulateIoT,
  getLeaderboard,
  getMapStateStats,
  getCarbonFootprint,
  getTariffEstimate,
  getTariffTemplate,
  uploadTariffs
};
