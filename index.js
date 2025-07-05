// index.js (or server.js/app.js - whatever you name it)
// This file will be deployed as a Vercel Serverless Function

// Using Node.js's built-in 'http' module for Vercel compatibility,
// but you can also use 'express' if you prefer for more complex routing.
// For a single endpoint, 'http' is simple and lightweight.

import { URL } from 'url'; // Node.js's URL module for parsing query parameters

// The global fetch API is available in Node.js >= 18 on Vercel.
// No 'node-fetch' import needed if your Vercel runtime is Node.js 18+.

export default async function handler(req, res) {
    // Get the API token from Vercel environment variables.
    // Make sure to set WAQI_API_TOKEN on Vercel.
    const API_TOKEN = process.env.WAQI_API_TOKEN;

    // Check if API_TOKEN is set
    if (!API_TOKEN) {
        console.error('Error: WAQI_API_TOKEN environment variable is not set on Vercel.');
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
            status: 'error',
            message: 'Server configuration error: API token missing. Please contact administrator.'
        }));
        return;
    }

    // Parse the URL to get query parameters
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

    // Encode the location to handle spaces and special characters in URLs
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
                statusCode = 401; // 401 Unauthorized for invalid key
                errorMessage = 'Invalid API Token for WAQI. Please check your WAQI_API_TOKEN.';
            } else if (response.status === 429) { // Too Many Requests
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
            // Send the raw data directly from WAQI API
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(data));
        } else {
            // Handle specific errors from WAQI API's JSON response
            res.writeHead(400, { 'Content-Type': 'application/json' }); // Use 400 for client-side issues from WAQI
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