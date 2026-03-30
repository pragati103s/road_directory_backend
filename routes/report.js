const express = require('express');
const router = express.Router();
const pool = require('../db/config'); // Apne db connection ka path sahi rakhein

// GET /road-master/:road_code
// http://localhost:3000/api/reports/road-master/UP32VR0044
router.get('/road-master/:road_code', async (req, res) => { 
    const { road_code } = req.params;
    try {
        const query = `
            SELECT dist_name, dist_code, road_name, road_id, div_code, chainage_from, chainage_to,
                   gis_length, gis_status, ref, remarks
            FROM road_master
            WHERE road_code = $1
        `;
        const result = await pool.query(query, [road_code]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'No data found for this road_code.' });
        }
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching road details:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// GET /road-master/:road_code
// http://localhost:3000/api/reports/road-details/UP32VR0044
router.get('/road-inventry', async (req, res) => {
    const { road_id, dist_code } = req.query;
    console.log(road_id, dist_code);
    if (!road_id || !dist_code) {
        return res.status(400).json({ error: 'road_id and dist_code are required.' });
    }
    try {
        const query = `
            SELECT inventory_code, dist_code,  owner, kmids, chainage_to,pavment_width,
            pavment_surface_type,ren_year,ren_month, grandular_thickness,bituminous_thickness,total_thickness,
            block,tahsil, vidhan_sabha, lok_sabha, municipality
            FROM road_inventory_current
            WHERE road_id = $1 AND dist_code = $2
        `; 
        const result = await pool.query(query, [road_id, dist_code]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'No data found for this road_code.' });
        }
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching road details:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});


// data on map
router.get('/road-geojson/:road_id&:dist_code', async (req, res) => {
  const { road_id, dist_code } = req.params;
  console.log(road_id);
  
  try {
    // Agar dist_code bhi chahiye to query me AND dist_code = $2 add karen
    const result = await pool.query(
      `SELECT road_code, ST_AsGeoJSON(geom) AS geometry FROM rd_master_pwd_4326 WHERE road_id = $1 AND dist_code = $2`,
      [road_id, dist_code]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Road not found' });
    }
    // GeoJSON Feature
    // / GeoJSON FeatureCollection
    const features = result.rows.map(row => ({
        type: "Feature",
        geometry: JSON.parse(row.geometry),
        properties: {
            road_id: row.road_id,
            road_code: row.road_code
        }
    }));

    const featureCollection = {
        type: "FeatureCollection",
        features: features
    };

    res.json(featureCollection);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

module.exports = router;