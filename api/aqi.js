const fetch = require('node-fetch');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Use POST method only' });
  }

  try {
    let body = '';
    for await (const chunk of req) {
      body += chunk;
    }

    const { city } = JSON.parse(body);

    if (!city) {
      return res.status(400).json({ error: 'City is required in request body.' });
    }

    const token = 'bd367983fdaea350c9b8da00ffbd81f8bb109594';
    const apiUrl = `https://api.waqi.info/feed/${city}/?token=${token}`;

    const response = await fetch(apiUrl);
    const data = await response.json();

    if (data.status === 'ok') {
      res.status(200).json({ success: true, data: data.data });
    } else {
      res.status(404).json({ success: false, message: 'City not found or data unavailable.' });
    }

  } catch (error) {
    res.status(500).json({ success: false, message: 'Invalid JSON or server error', error: error.message });
  }
};
