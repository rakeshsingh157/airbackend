// waqi.js
export default async function handler(req, res) {
  const API_TOKEN = process.env.WAQI_API_TOKEN;
  const { location } = req.query;

  if (!API_TOKEN) {
    return res.status(500).json({
      status: 'error',
      message: 'Missing API Token',
    });
  }

  if (!location) {
    return res.status(400).json({
      status: 'error',
      message: 'Location parameter required. Use ?location=CityName',
    });
  }

  const apiUrl = `https://api.waqi.info/feed/${encodeURIComponent(location)}/?token=${API_TOKEN}`;

  try {
    const response = await fetch(apiUrl);
    const data = await response.json();

    if (data.status === 'ok') {
      return res.status(200).json({
        status: 'success',
        location: data.data.city.name,
        aqi: data.data.aqi,
        time: data.data.time.s,
      });
    } else {
      return res.status(400).json({
        status: 'error',
        message: data.message || 'Unknown error',
        details: data
      });
    }
  } catch (err) {
    return res.status(500).json({
      status: 'error',
      message: 'Internal server error',
      details: err.message,
    });
  }
}
