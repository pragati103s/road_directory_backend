const express = require('express');
const router = express.Router();
const { query } = require('../db/config'); // PostgreSQL query function
const { getAllDistricts, getAllZones, getDistrictByCircleCode, getAllDivision,
  getDivisionByDistrict, getRoadByDistrict, getRoadByDivision} = require('../queries/queries');

// Get all Districts
// http://localhost:3000/api/districts  {"circle_code":1}
router.post('/districts', async (req, res) => {
  const { circle_code } =req.body || '';
  // console.log([circle_code])
  try {
    let result;
    if(circle_code){
      result= await query(getDistrictByCircleCode(), [circle_code]);
    }else{
      result=await query(getAllDistricts());
    }
    // console.log(result);
    
    if(result.rows.length > 0){
      res.json(result.rows);
    }
    else{
      res.status(404).json({error: 'No district found'})
    }
    
  } catch (err) {
    console.error('Error fetching users:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// get all zones
// http://localhost:3000/api/zones
router.get('/zones', async (req, res)=>{
    try{
        const result = await query(getAllZones());
        res.json(result.rows);
    }catch(err){
        console.error('Error fetching users:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }

})


// get all division and by district
router.post('/division', async (req, res)=>{
  const {dist_code} =req.body || '';
  try {
    let result; 
    if(dist_code){
      result = await query(getDivisionByDistrict(), [dist_code])
       console.log(result,"55");
    }
    else  {
      result= await query(getAllDivision())
       console.log(result, "59");
    }
    console.log(result);
    
    if(result.rows.length > 0){
      res.json(result.rows);
    }
    else  res.status(404).json({error: 'No district found'})
    
  } catch (err) {
    console.error('Error fetching users:', err);
        res.status(500).json({ error: 'Internal Server Error' });
  }
})

// get all road and by district
router.post('/road', async (req, res)=>{
  const {dist_code} =req.body || '';
  const {div_code} =req.body || '';
  try {
    let result; 
    if(dist_code){
      result = await query(getRoadByDistrict(), [dist_code])
       console.log(result,"55");
    }
    if(div_code){
      result = await query(getRoadByDivision(), [div_code])
       console.log(result,"55");
    }
    else  {
      // result= await query(getAllDivision())
       console.log(result, "59");
    }
    console.log(result);
    
    if(result.rows.length > 0){
      res.json(result.rows);
    }
    else  res.status(404).json({error: 'No district found'})
    
  } catch (err) {
    console.error('Error fetching users:', err);
        res.status(500).json({ error: 'Internal Server Error' });
  }
})



module.exports = router;
