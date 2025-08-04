const express = require('express');
const cors = require('cors'); // CORS package import
const app = express();
const circleMaster = require('./routes/circleMasterRoutes'); // Circle master routes
const roads = require('./routes/routes');
const editRoadRouter = require('./routes/editRoad');
const reportRouter = require('./routes/report');

 


// Enable CORS for all origins
app.use(cors()); // Ye line sabhi origins se requests ko allow karegi

// app.use(cors({
//   origin: 'http://your-frontend-domain.com', // Only allow requests from a specific domain
//   methods: ['GET', 'POST'],                 // Only allow specific methods
//   allowedHeaders: ['Content-Type', 'Authorization'], // Specify allowed headers
// }));

 
// Middleware
app.use(express.json()); // To parse JSON request bodies

// Routes
app.use('/api', roads);
app.use('/api/circle', circleMaster);
app.use('/api/getRoad', editRoadRouter);
app.use('/api/reports', reportRouter);
 

// Start server 
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
