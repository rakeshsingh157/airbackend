// waqi.js
export default async function handler(req, res) {
  const API_TOKEN = "bd367983fdaea350c9b8da00ffbd81f8bb109594"; // Hardcoded token for testing
  const { location } = req.query;

  if (!location) {
    return res.status(400).json({
      status: 'error',
      message: 'Location parameter required. Example: /api?location=Beijing',
    });
  }

  const apiUrl = `https://api.waqi.info/feed/${encodeURIComponent(location)}/?token=${API_TOKEN}`;

  try {
    const response = await fetch(apiUrl);
    const data = await response.json();

    if (data.status === 'ok') {
      return res.status(200).json({
        status: 'success',
        city: data.data.city.name,
        aqi: data.data.aqi,
        dominantPollutant: data.data.dominentpol,
        time: data.data.time.s,
        iaqi: data.data.iaqi,           // Includes CO, PM2.5, O3, etc.
        forecast: data.data.forecast    // Daily forecast (pm25, uvi, etc.)
      });
    } else {
      return res.status(400).json({
        status: 'error',
        message: data.message || 'Unknown error from WAQI API.',
        details: data
      });
    }
  } catch (err) {
    return res.status(500).json({
      status: 'error',
      message: 'Internal server error',
      details: err.message
    });
  }
}
