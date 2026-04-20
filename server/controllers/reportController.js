/**
 * Report Controller
 * Generates usage reports with cost estimation and savings analysis
 * Supports CSV and PDF export
 */

const Usage = require('../models/Usage');

/**
 * GET /api/reports
 * Generate a usage report for a date range
 * Query params: startDate, endDate, type
 */
const generateReport = async (req, res, next) => {
  try {
    const { startDate, endDate, type } = req.query;
    const now = new Date();

    // Default to current month if no dates provided
    const start = startDate ? new Date(startDate) : new Date(now.getFullYear(), now.getMonth(), 1);
    const end = endDate ? new Date(endDate) : now;

    // Build filter
    const filter = {
      userId: req.user._id,
      timestamp: { $gte: start, $lte: end },
    };
    if (type) filter.type = type;

    // Get all usage data for the period
    const usage = await Usage.find(filter).sort({ timestamp: 1 });

    // Calculate summary statistics
    const summary = {
      water: { totalValue: 0, totalCost: 0, count: 0, avgDaily: 0 },
      electricity: { totalValue: 0, totalCost: 0, count: 0, avgDaily: 0 },
    };

    usage.forEach(record => {
      const t = record.type;
      summary[t].totalValue += record.value;
      summary[t].totalCost += record.cost;
      summary[t].count += 1;
    });

    // Calculate daily averages
    const daysDiff = Math.max(1, Math.ceil((end - start) / (1000 * 60 * 60 * 24)));
    summary.water.avgDaily = parseFloat((summary.water.totalValue / daysDiff).toFixed(2));
    summary.electricity.avgDaily = parseFloat((summary.electricity.totalValue / daysDiff).toFixed(2));
    summary.water.totalCost = parseFloat(summary.water.totalCost.toFixed(2));
    summary.electricity.totalCost = parseFloat(summary.electricity.totalCost.toFixed(2));
    summary.water.totalValue = parseFloat(summary.water.totalValue.toFixed(1));
    summary.electricity.totalValue = parseFloat(summary.electricity.totalValue.toFixed(2));

    // Group data by day for the report table
    const dailyBreakdown = {};
    usage.forEach(record => {
      const day = record.timestamp.toISOString().split('T')[0];
      if (!dailyBreakdown[day]) {
        dailyBreakdown[day] = { date: day, water: 0, electricity: 0, waterCost: 0, electricityCost: 0 };
      }
      dailyBreakdown[day][record.type] += record.value;
      dailyBreakdown[day][`${record.type}Cost`] += record.cost;
    });

    const dailyData = Object.values(dailyBreakdown).map(d => ({
      ...d,
      water: parseFloat(d.water.toFixed(1)),
      electricity: parseFloat(d.electricity.toFixed(2)),
      waterCost: parseFloat(d.waterCost.toFixed(2)),
      electricityCost: parseFloat(d.electricityCost.toFixed(2)),
      totalCost: parseFloat((d.waterCost + d.electricityCost).toFixed(2)),
    }));

    res.json({
      success: true,
      data: {
        period: { start: start.toISOString(), end: end.toISOString(), days: daysDiff },
        summary,
        totalCost: parseFloat((summary.water.totalCost + summary.electricity.totalCost).toFixed(2)),
        dailyData,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/reports/download/csv
 * Download usage report as CSV file
 */
const downloadCSV = async (req, res, next) => {
  try {
    const { startDate, endDate, type } = req.query;
    const now = new Date();

    const start = startDate ? new Date(startDate) : new Date(now.getFullYear(), now.getMonth(), 1);
    const end = endDate ? new Date(endDate) : now;

    const filter = {
      userId: req.user._id,
      timestamp: { $gte: start, $lte: end },
    };
    if (type) filter.type = type;

    const usage = await Usage.find(filter).sort({ timestamp: 1 });

    // Build CSV content
    const headers = 'Date,Type,Value,Unit,Cost ($),Source\n';
    const rows = usage.map(r =>
      `${r.timestamp.toISOString()},${r.type},${r.value},${r.unit},${r.cost.toFixed(2)},${r.source}`
    ).join('\n');

    const csv = headers + rows;

    // Set headers for file download
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=hydrogrid-report-${start.toISOString().split('T')[0]}.csv`);
    res.send(csv);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/reports/download/pdf
 * Download usage report as PDF file
 * Uses PDFKit to generate a formatted document
 */
const downloadPDF = async (req, res, next) => {
  try {
    const PDFDocument = require('pdfkit');
    const { startDate, endDate } = req.query;
    const now = new Date();

    const start = startDate ? new Date(startDate) : new Date(now.getFullYear(), now.getMonth(), 1);
    const end = endDate ? new Date(endDate) : now;

    const usage = await Usage.find({
      userId: req.user._id,
      timestamp: { $gte: start, $lte: end },
    }).sort({ timestamp: 1 });

    // Calculate totals
    let waterTotal = 0, electricityTotal = 0, waterCost = 0, electricityCost = 0;
    usage.forEach(r => {
      if (r.type === 'water') { waterTotal += r.value; waterCost += r.cost; }
      else { electricityTotal += r.value; electricityCost += r.cost; }
    });

    // Create PDF document
    const doc = new PDFDocument({ size: 'A4', margin: 50 });

    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=hydrogrid-report-${start.toISOString().split('T')[0]}.pdf`);

    // Pipe PDF to response
    doc.pipe(res);

    // Title
    doc.fontSize(24).fillColor('#3b82f6').text('HydroGrid', { align: 'center' });
    doc.fontSize(12).fillColor('#64748b').text('Smart Water & Electricity Intelligence Report', { align: 'center' });
    doc.moveDown();

    // Period
    doc.fontSize(10).fillColor('#333')
      .text(`Report Period: ${start.toLocaleDateString()} - ${end.toLocaleDateString()}`);
    doc.text(`Generated: ${new Date().toLocaleString()}`);
    doc.text(`Total Readings: ${usage.length}`);
    doc.moveDown();

    // Draw separator
    doc.moveTo(50, doc.y).lineTo(545, doc.y).strokeColor('#e2e8f0').stroke();
    doc.moveDown();

    // Summary
    doc.fontSize(16).fillColor('#1e293b').text('Summary');
    doc.moveDown(0.5);

    doc.fontSize(11).fillColor('#333');
    doc.text(`💧 Water: ${waterTotal.toFixed(1)} liters | Cost: $${waterCost.toFixed(2)}`);
    doc.text(`⚡ Electricity: ${electricityTotal.toFixed(2)} kWh | Cost: $${electricityCost.toFixed(2)}`);
    doc.text(`📊 Total Cost: $${(waterCost + electricityCost).toFixed(2)}`);
    doc.moveDown();

    // Footer
    doc.fontSize(8).fillColor('#94a3b8')
      .text('Generated by HydroGrid Intelligence Platform', 50, 750, { align: 'center' });

    doc.end();
  } catch (error) {
    next(error);
  }
};

module.exports = { generateReport, downloadCSV, downloadPDF };
