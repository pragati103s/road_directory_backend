const express = require('express');
const router = express.Router();
const { query } = require('../db/config');
const { getCirclesByZoneCode, getCircles } = require('../queries/queries');

// POST method to fetch circles based on zone_code (or all if zone_code not provided)
// http://localhost:3000/api/circle/circle  { "zone_code": 1 }
router.post('/circle', async (req, res) => {
  const { zone_code } = req.body || '';  // Get zone_code from the request body

  try {
    let result;
    
    // Check if zone_code is provided, else fetch all circles
    if (zone_code) {
      result = await query(getCirclesByZoneCode(), [zone_code]);
    } else {
      result = await query(getCircles());
    }

    // Return the result if circles are found
    if (result.rows.length > 0) {
      res.json(result.rows);
    } else {
      res.status(404).json({ error: 'No circles found' });
    }
  } catch (err) {
    console.error('Error fetching circles:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;
