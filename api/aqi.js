export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Only POST allowed.' });
  }

  const { city } = req.body || {};
  if (!city) {
    return res.status(400).json({ error: 'City is required.' });
  }

  const token = 'bd367983fdaea350c9b8da00ffbd81f8bb109594';
  const resp = await fetch(`https://api.waqi.info/feed/${city}/?token=${token}`);
  const data = await resp.json();

  if (data.status === 'ok') {
    res.status(200).json({ success: true, data: data.data });
  } else {
    res.status(404).json({ success: false, message: 'City not found.' });
  }
}
