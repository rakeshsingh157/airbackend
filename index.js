// index.js (Make sure your file looks like this, especially the export)
import { URL } from 'url';

export default async function handler(req, res) {
    const API_TOKEN = process.env.WAQI_API_TOKEN;

    if (!API_TOKEN) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
            status: 'error',
            message: 'Server configuration error: API token missing. Please contact administrator.'
        }));
        return;
    }

    const requestUrl = new URL(req.url, `http://${req.headers.host}`);
    const location = requestUrl.searchParams.get('location');

    if (!location) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
            status: 'error',
            message: 'Location parameter is required. Usage: /?location=your_city_name'
        }));
        return;
    }

    const encodedLocation = encodeURIComponent(location);
    const apiUrl = `https://api.waqi.info/feed/${encodedLocation}/?token=${API_TOKEN}`;

    console.log(`[Vercel Function] Fetching data for "${location}" from: ${apiUrl}`);

    try {
        const response = await fetch(apiUrl);

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`[Vercel Function] WAQI API response not OK. Status: ${response.status}, Text: ${errorText.substring(0, 200)}...`);

            let statusCode = response.status;
            let errorMessage = `External API error: ${response.statusText || 'Unknown error'}.`;
            let errorDetails = errorText;

            if (response.status === 404) {
                errorMessage = `Location "${location}" not found or supported by the WAQI API. Try a different spelling or a major city.`;
            } else if (response.status === 400 && errorText.includes('Invalid key')) {
                statusCode = 401;
                errorMessage = 'Invalid API Token for WAQI. Please check your WAQI_API_TOKEN.';
            } else if (response.status === 429) {
                errorMessage = 'Too many requests to WAQI API. Please try again later.';
            }

            res.writeHead(statusCode, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
                status: 'error',
                message: errorMessage,
                details: errorDetails
            }));
            return;
        }

        const data = await response.json();

        if (data.status === 'ok') {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(data));
        } else {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
                status: 'error',
                message: data.message || 'Error fetching data from WAQI API.',
                details: data
            }));
        }

    } catch (error) {
        console.error('[Vercel Function] Catch-all error:', error);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
            status: 'error',
            message: 'An unexpected server error occurred.',
            details: error.message
        }));
    }
}