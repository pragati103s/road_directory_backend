const express = require('express');
const router = express.Router();
const pool = require('../db/config'); // PostgreSQL pool (pg package)


// get all road ids
router.get('/road-ids', async (req, res) => {
  try { 
    const result = await pool.query(' SELECT  DISTINCT road_id  FROM rd_master_pwd_4326;');
    if (result.rows.length === 0) { 
        return res.status(404).json({ error: 'No roads found' });
        }
    res.json(result.rows.map(row => row.road_id));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }

});

// http://localhost:3000/api/getRoad/road-geojson/VR0855
router.get('/road-geojson/:road_id', async (req, res) => {
  const { road_id } = req.params;
  try { 
    // Get the road as GeoJSON
    const result = await pool.query(
      `SELECT id_0,  id, line_id, edit_statu, edit_user, edit_times, length_geo,
        dist_code, road_code, segment_id, cat, road_id, editing_re, point_rema, st_length_, 
        ST_AsGeoJSON(geom) AS geometry FROM rd_master_pwd_4326 WHERE road_id = $1`,
      [road_id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Road not found' });
    }
    // Build GeoJSON Feature
    const row = result.rows[0];
    const feature = {
      type: "Feature",
      geometry: JSON.parse(row.geometry),
      properties: {
        road_id: row.road_id
        // Add other properties if needed
      }
    };
    res.json(feature);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});


router.post('/update-road', async (req, res) => {
  const { road_id, geometry, edited_by, edited_at } = req.body;
  console.log(geometry);
  

  try {
    // 1. Get old geometry for logging 
    const oldResult = await pool.query(
      `SELECT id_0,  id, line_id, edit_statu, edit_user, edit_times, length_geo,
        dist_code, road_code, segment_id, cat, road_id, editing_re, point_rema, st_length_, 
        ST_AsGeoJSON(geom) as geom FROM rd_master_pwd_4326 WHERE road_id = $1`,
      [road_id]
    );
    const old_geom = oldResult.rows[0]?.geom;

    // 2. Update geometry and edit info in main table
    await pool.query(
      'UPDATE rd_master_pwd_4326 SET geom = ST_SetSRID(ST_GeomFromGeoJSON($1), 4326), edit_date = $2, edited_by = $3 WHERE road_id = $4',
      [JSON.stringify(geometry), edited_at, edited_by, road_id]
    );

    // 3. Insert into edit log for record keeping
    await pool.query(
      `INSERT INTO road_edit_log 
        (road_id, old_geom, new_geom, edited_by, edited_at)
       VALUES ($1, ST_SetSRID(ST_GeomFromGeoJSON($2), 4326), ST_SetSRID(ST_GeomFromGeoJSON($3), 4326), $4, $5)`,
      [
        road_id, 
        old_geom,
        JSON.stringify(geometry),
        edited_by,
        edited_at,
      ]
    );

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;