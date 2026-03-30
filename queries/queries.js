// Get all districts (district_id and district_name)
const getAllDistricts = () => {
  return 'Select dist_code, dist_name from district_master';
};

// get all zone 
const getAllZones = () =>{
    return 'Select zone_code, zone_name from zone_master'
}

// Query to get circle details by zone_code = 1
const getCirclesByZoneCode = () => {
  return 'SELECT zone_code, circle_code, circle_name FROM circle_master WHERE zone_code = $1';
}; 
// get all circle
const getCircles = () =>{
    return 'SELECT zone_code, circle_code, circle_name FROM circle_master'
}

// get district by circle code
const getDistrictByCircleCode = () =>{
  return 'Select dist_code, dist_name, zone_code, circle_code from district_master WHERE circle_code =$1'
}

// get division
const getAllDivision = () =>{
  return 'Select div_id, div_code, div_name, dist_code, zone_code from division_master'
}

const getDivisionByDistrict = () =>{
  return 'Select  div_id, div_code, div_name, dist_code, zone_code from division_master WHERE dist_code = $1'
}
// get division


const getRoadByDistrict = () =>{
  return 'Select   dist_code, road_code, road_name from road_master WHERE dist_code = $1'
}
const getRoadByDivision = () =>{
  return 'Select  div_code, road_code, road_name from road_master WHERE div_code = $1'
}

module.exports = {
  getAllDistricts,
  getAllZones,
  getCirclesByZoneCode,
  getCircles,
  getDistrictByCircleCode,
  getAllDivision,
  getDivisionByDistrict,
  getRoadByDistrict,
  getRoadByDivision
};