/**
 * Report Controller (Supabase/Postgres version)
 */

const { query } = require('../database/db');

const generateReport = async (req, res, next) => {
  try {
    const { startDate, endDate, type } = req.query;
    const now = new Date();
    const start = startDate ? new Date(startDate) : new Date(now.getFullYear(), now.getMonth(), 1);
    const end = endDate ? new Date(endDate) : new Date();
    
    // Set end to the very end of the day to include all readings for that day
    if (endDate) {
      end.setHours(23, 59, 59, 999);
    }

    let sql = `
      SELECT 
        type,
        (date_trunc('day', timestamp AT TIME ZONE 'Asia/Kolkata'))::date::text as "dateStr",
        SUM(value) as "totalValue",
        SUM(cost) as "totalCost",
        COUNT(*) as count
      FROM usage_data
      WHERE user_id = $1 AND timestamp >= $2 AND timestamp <= $3
    `;
    let params = [req.user.id, start, end];
    if (type) { 
      sql += ' AND type = $4'; 
      params.push(type); 
    }
    sql += ' GROUP BY "dateStr", type ORDER BY "dateStr" ASC';

    const result = await query(sql, params);
    const daysDiff = Math.max(1, Math.ceil((end - start) / (1000 * 60 * 60 * 24)));

    const dailyData = [];
    const summary = {
      water: { totalValue: 0, totalCost: 0, count: 0 },
      electricity: { totalValue: 0, totalCost: 0, count: 0 }
    };

    // Pre-fill dailyData with zero-entries for the entire range
    const iter = new Date(start);
    const endIter = new Date(end);
    // Use local-safe iteration
    while (iter <= endIter) {
      const dStr = iter.toISOString().split('T')[0];
      dailyData.push({ date: dStr, water: 0, electricity: 0, waterCost: 0, electricityCost: 0, totalCost: 0 });
      iter.setDate(iter.getDate() + 1);
    }

    result.rows.forEach(item => {
      const t = item.type;
      summary[t].totalValue += parseFloat(item.totalValue);
      summary[t].totalCost += parseFloat(item.totalCost);
      summary[t].count += parseInt(item.count);

      const dStr = item.dateStr;
      let dayEntry = dailyData.find(d => d.date === dStr);
      if (dayEntry) {
        dayEntry[t] = parseFloat(parseFloat(item.totalValue).toFixed(t === 'water' ? 1 : 2));
        dayEntry[`${t}Cost`] = parseFloat(parseFloat(item.totalCost).toFixed(2));
        dayEntry.totalCost = parseFloat((dayEntry.waterCost + dayEntry.electricityCost).toFixed(2));
      }
    });

    summary.water.avgDaily = parseFloat((summary.water.totalValue / daysDiff).toFixed(1));
    summary.electricity.avgDaily = parseFloat((summary.electricity.totalValue / daysDiff).toFixed(2));

    res.json({
      success: true,
      data: {
        period: { start: start.toISOString(), end: end.toISOString(), days: daysDiff },
        summary,
        totalCost: parseFloat((summary.water.totalCost + summary.electricity.totalCost).toFixed(2)),
        dailyData,
      }
    });
  } catch (error) {
    next(error);
  }
};

const downloadCSV = async (req, res, next) => {
  try {
    const { startDate, endDate, type } = req.query;
    const now = new Date();
    const start = startDate ? new Date(startDate) : new Date(now.getFullYear(), now.getMonth(), 1);
    const end = endDate ? new Date(endDate) : new Date();
    if (endDate) end.setHours(23, 59, 59, 999);

    let sql = 'SELECT * FROM usage_data WHERE user_id = $1 AND timestamp >= $2 AND timestamp <= $3';
    let params = [req.user.id, start, end];
    if (type) { sql += ' AND type = $4'; params.push(type); }
    sql += ' ORDER BY timestamp ASC';

    const result = await query(sql, params);

    const headers = 'Date,Type,Value,Unit,Cost (₹),Source\n';
    const rows = result.rows.map(r =>
      `${r.timestamp.toISOString()},${r.type},${r.value},${r.unit},${parseFloat(r.cost).toFixed(2)},${r.source}`
    ).join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=report-${start.toISOString().split('T')[0]}.csv`);
    res.send(headers + rows);
  } catch (error) {
    next(error);
  }
};

const downloadPDF = async (req, res, next) => {
  try {
    const PDFDocument = require('pdfkit');
    const { startDate, endDate } = req.query;
    const now = new Date();
    const start = startDate ? new Date(startDate) : new Date(now.getFullYear(), now.getMonth(), 1);
    const end = endDate ? new Date(endDate) : new Date();
    if (endDate) end.setHours(23, 59, 59, 999);

    const result = await query(
      'SELECT * FROM usage_data WHERE user_id = $1 AND timestamp >= $2 AND timestamp <= $3 ORDER BY timestamp ASC',
      [req.user.id, start, end]
    );

    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=report-${start.toISOString().split('T')[0]}.pdf`);
    doc.pipe(res);

    doc.fontSize(24).text('HydroGrid Report', { align: 'center' });
    doc.fontSize(10).text(`Period: ${start.toLocaleDateString()} - ${end.toLocaleDateString()}`, { align: 'center' });
    doc.moveDown();

    let waterCost = 0, elecCost = 0;
    result.rows.forEach(r => {
        if (r.type === 'water') waterCost += parseFloat(r.cost);
        else elecCost += parseFloat(r.cost);
    });

    doc.text(`💧 Water Cost: ₹${waterCost.toFixed(2)}`);
    doc.text(`⚡ Electricity Cost: ₹${elecCost.toFixed(2)}`);
    doc.text(`📊 Total: ₹${(waterCost + elecCost).toFixed(2)}`);
    doc.end();
  } catch (error) {
    next(error);
  }
};

module.exports = { generateReport, downloadCSV, downloadPDF };
