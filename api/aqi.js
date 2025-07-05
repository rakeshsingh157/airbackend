// api/aqi.js

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Only POST requests are allowed.' });
  }

  try {
    const { city } = req.body;

    if (!city) {
      return res.status(400).json({ error: 'City is required in request body.' });
    }

    const token = 'bd367983fdaea350c9b8da00ffbd81f8bb109594';
    const apiUrl = `https://api.waqi.info/feed/${city}/?token=${token}`;

    const response = await fetch(apiUrl);
    const data = await response.json();

    if (data.status === 'ok') {
      return res.status(200).json({ success: true, data: data.data });
    } else {
      return res.status(404).json({ success: false, message: 'City not found or data unavailable.' });
    }

  } catch (err) {
    return res.status(500).json({ error: 'Server Error', details: err.message });
  }
}
