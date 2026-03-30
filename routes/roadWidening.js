const express = require('express');
const router = express.Router();
const pool = require('../db/config');   // path adjust karo agar needed

// 🔥 API: Road Widening
router.post('/roads', async (req, res) => {
  try {
    const { district, road_category,   min_width  } = req.body;

    console.log("INPUT:", district, road_category,  min_width ); 

    const query = `
      WITH road_width AS (
    SELECT 
        r.road_code,  r.cat,  r.dist_code,  r.geom,
        MIN(w.pavment_width) AS min_width
    FROM rd_master_pwd_4326 r
    JOIN road_inventory_current w 
        ON r.road_code = w.road_code
    WHERE 
        r.dist_code = $1
        AND LOWER(r.cat) = LOWER($2)
    GROUP BY 
        r.road_code, r.cat, r.dist_code, r.geom
),

final_data AS (
    SELECT 
        r.*,

        CASE 
            WHEN EXISTS (
                SELECT 1 FROM trafficdata t
                WHERE ST_DWithin(r.geom, t.geom, 0.0005)
            ) THEN 'YES'
            ELSE 'NO'
        END AS has_traffic,

        CASE 
            WHEN EXISTS (
                SELECT 1 FROM industry i
                WHERE ST_DWithin(r.geom, i.geom, 0.001)
            ) THEN 'YES'
            ELSE 'NO'
        END AS near_industry,

        CASE 
            WHEN EXISTS (
                SELECT 1 FROM trafficdata t
                WHERE ST_DWithin(r.geom, t.geom, 0.0005)
            ) THEN 'TRAFFIC'

            WHEN EXISTS (
                SELECT 1 FROM industry i
                WHERE ST_DWithin(r.geom, i.geom, 0.001)
            ) THEN 'INDUSTRY'

            ELSE 'NONE'
        END AS reason

    FROM road_width r
    WHERE r.min_width < $3
)

SELECT jsonb_build_object(
    'type', 'FeatureCollection',
    'features', jsonb_agg(
        jsonb_build_object(
            'type', 'Feature',
            'geometry', ST_AsGeoJSON(geom)::jsonb,
            'properties', jsonb_build_object(
                'road_code', road_code,
                'min_width', min_width,
                'has_traffic', has_traffic,
                'near_industry', near_industry,
                'reason', reason
            )
        )
    )
) AS geojson
FROM final_data;
    `;

    const values = [district, road_category, min_width ];

    const result = await pool.query(query, values);

    const geojson = result.rows[0]?.geojson || {
      type: "FeatureCollection",
      features: []
    };

    res.json({
      success: true,
      data: geojson
    });

  } catch (error) {
    console.error("ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Server Error"
    });
  }
});

module.exports = router;