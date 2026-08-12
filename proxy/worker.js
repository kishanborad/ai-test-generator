export default {
  async fetch(request) {
    const url = new URL(request.url);
    const targetUrl = url.searchParams.get('url');

    if (!targetUrl) {
      return new Response(JSON.stringify({ error: 'Missing ?url= parameter' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      });
    }

    try {
      const targetResponse = await fetch(targetUrl, {
        headers: { 'User-Agent': 'AI-Test-Generator-Proxy/1.0' },
      });

      const body = await targetResponse.text();
      return new Response(body, {
        status: targetResponse.status,
        headers: {
          'Content-Type': targetResponse.headers.get('Content-Type') || 'text/html',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
          'X-Proxy-Source': targetUrl,
        },
      });
    } catch (err) {
      return new Response(JSON.stringify({ error: 'Failed to fetch target URL' }), {
        status: 502,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      });
    }
  },
};
