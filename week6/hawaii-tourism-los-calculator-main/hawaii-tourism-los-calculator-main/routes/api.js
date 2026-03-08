const express = require('express');
const router = express.Router();
const TourismData = require('../models/TourismData');

const MAX_FIELD_LENGTH = 100;

function sanitizeText(value) {
  if (value === undefined || value === null || value === '') {
    return null;
  }

  if (typeof value !== 'string') {
    return null;
  }

  const trimmedValue = value.trim();

  if (!trimmedValue || trimmedValue.length > MAX_FIELD_LENGTH) {
    return null;
  }

  return trimmedValue;
}

function handleServerError(res, error, context) {
  console.error(`[API Error] ${context}:`, error);
  return res.status(500).json({
    success: false,
    error: 'Internal server error'
  });
}

// Get all unique categories (groups)
router.get('/categories', async (req, res) => {
  try {
    const categories = await TourismData.distinct('group');
    res.json({ success: true, data: categories.sort() });
  } catch (error) {
    return handleServerError(res, error, 'GET /categories');
  }
});

// Get all unique locations (indicators)
router.get('/locations', async (req, res) => {
  try {
    const locations = await TourismData.distinct('indicator');
    res.json({ success: true, data: locations.sort() });
  } catch (error) {
    return handleServerError(res, error, 'GET /locations');
  }
});

// Calculate average length of stay
router.post('/calculate', async (req, res) => {
  try {
    const category = sanitizeText(req.body?.category);
    const location = sanitizeText(req.body?.location);

    if (!category) {
      return res.status(400).json({
        success: false,
        error: 'Valid category is required'
      });
    }

    // Build query
    const query = { group: category };
    if (location) {
      query.indicator = location;
    }

    // Find matching records
    const records = await TourismData.find(query).lean();

    if (records.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'No data found for the specified criteria'
      });
    }

    // Collect all values
    const allValues = [];
    records.forEach(record => {
      record.yearlyData.forEach(yearData => {
        allValues.push({
          year: yearData.year,
          value: yearData.value,
          location: record.indicator
        });
      });
    });

    if (allValues.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'No valid data points found'
      });
    }

    // Calculate statistics
    const values = allValues.map(v => v.value);
    const sum = values.reduce((a, b) => a + b, 0);
    const average = sum / values.length;
    const min = Math.min(...values);
    const max = Math.max(...values);

    const minEntry = allValues.find(v => v.value === min);
    const maxEntry = allValues.find(v => v.value === max);

    // Calculate year-over-year data for chart
    const yearlyAverages = {};
    allValues.forEach(item => {
      if (!yearlyAverages[item.year]) {
        yearlyAverages[item.year] = [];
      }
      yearlyAverages[item.year].push(item.value);
    });

    const chartData = Object.keys(yearlyAverages).sort().map(year => ({
      year,
      average: yearlyAverages[year].reduce((a, b) => a + b, 0) / yearlyAverages[year].length
    }));

    res.json({
      success: true,
      data: {
        category,
        location: location || 'All locations',
        statistics: {
          average: parseFloat(average.toFixed(2)),
          min: {
            value: min,
            year: minEntry.year,
            location: minEntry.location
          },
          max: {
            value: max,
            year: maxEntry.year,
            location: maxEntry.location
          },
          dataPoints: values.length
        },
        chartData
      }
    });

  } catch (error) {
    return handleServerError(res, error, 'POST /calculate');
  }
});

// Get all data (for admin/debugging)
router.get('/data', async (req, res) => {
  if (process.env.NODE_ENV === 'production') {
    return res.status(403).json({
      success: false,
      error: 'This endpoint is disabled in production'
    });
  }

  try {
    const data = await TourismData.find().limit(100).lean();
    res.json({ success: true, count: data.length, data });
  } catch (error) {
    return handleServerError(res, error, 'GET /data');
  }
});

module.exports = router;
