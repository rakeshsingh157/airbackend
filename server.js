require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Environment variables
const WAQI_TOKEN = process.env.WAQI_TOKEN || 'bd367983fdaea350c9b8da00ffbd81f8bb109594';
const BASE_URL = 'https://api.waqi.info';

// Routes
app.get('/api/air-quality', async (req, res) => {
  try {
    const { city = 'here' } = req.query;
    
    const response = await axios.get(`${BASE_URL}/feed/${city}/`, {
      params: {
        token: WAQI_TOKEN
      }
    });
    
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching air quality data:', error.message);
    res.status(500).json({
      error: 'Failed to fetch air quality data',
      details: error.message
    });
  }
});

app.get('/api/air-quality/:city', async (req, res) => {
  try {
    const { city } = req.params;
    
    const response = await axios.get(`${BASE_URL}/feed/${city}/`, {
      params: {
        token: WAQI_TOKEN
      }
    });
    
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching air quality data:', error.message);
    res.status(500).json({
      error: 'Failed to fetch air quality data',
      details: error.message
    });
  }
});

// Health check endpoint
app.get('/', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Air Quality API is running',
    endpoints: {
      currentLocation: '/api/air-quality',
      specificCity: '/api/air-quality/:city'
    }
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;