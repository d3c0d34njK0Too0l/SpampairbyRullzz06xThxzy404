module.exports = (req, res) => {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 'no-store');

    const uptime = process.uptime();
    const uptimeFormatted = `${Math.floor(uptime / 3600)}h ${Math.floor((uptime % 3600) / 60)}m ${Math.floor(uptime % 60)}s`;
    const now = new Date().toISOString();
    const nodeVersion = process.version;

    const html = `<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Mikasa Pairing API</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    font-family: 'Courier New', monospace;
    background: #0a0a0a;
    color: #00ff88;
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
  }
  .container {
    max-width: 700px;
    width: 100%;
    background: #111;
    border: 1px solid #00ff88;
    border-radius: 8px;
    padding: 30px;
    box-shadow: 0 0 30px rgba(0, 255, 136, 0.15);
  }
  h1 {
    font-size: 22px;
    margin-bottom: 8px;
    color: #00ff88;
    letter-spacing: 1px;
  }
  .subtitle {
    color: #666;
    font-size: 12px;
    margin-bottom: 25px;
  }
  .status-box {
    background: #0a0a0a;
    border-left: 3px solid #00ff88;
    padding: 12px 15px;
    margin-bottom: 25px;
    border-radius: 4px;
  }
  .status-item {
    display: flex;
    justify-content: space-between;
    padding: 4px 0;
    font-size: 13px;
  }
  .status-item span:first-child {
    color: #666;
  }
  .status-item span:last-child {
    color: #00ff88;
    font-weight: bold;
  }
  h2 {
    font-size: 15px;
    color: #00ff88;
    margin-top: 20px;
    margin-bottom: 10px;
    border-bottom: 1px dashed #333;
    padding-bottom: 6px;
  }
  .endpoint {
    background: #0a0a0a;
    border: 1px solid #222;
    padding: 12px;
    border-radius: 4px;
    margin-bottom: 12px;
    font-size: 12px;
    word-break: break-all;
  }
  .method {
    display: inline-block;
    background: #00ff88;
    color: #000;
    padding: 2px 8px;
    border-radius: 3px;
    font-weight: bold;
    font-size: 11px;
    margin-right: 8px;
  }
  .method.post {
    background: #ffaa00;
  }
  .url {
    color: #00ff88;
  }
  .desc {
    color: #888;
    font-size: 11px;
    margin-top: 6px;
    line-height: 1.5;
  }
  code {
    background: #1a1a1a;
    padding: 2px 6px;
    border-radius: 3px;
    color: #ffaa00;
    font-size: 11px;
  }
  .footer {
    margin-top: 30px;
    padding-top: 15px;
    border-top: 1px dashed #333;
    text-align: center;
    color: #444;
    font-size: 11px;
  }
  .blink {
    animation: blink 1.5s infinite;
  }
  @keyframes blink {
    0%, 50% { opacity: 1; }
    51%, 100% { opacity: 0.3; }
  }
</style>
</head>
<body>
<div class="container">
  <h1>◈ MIKASA PAIRING API ◈</h1>
  <div class="subtitle">WhatsApp Pairing Code Spammer — Powered by Baileys</div>

  <div class="status-box">
    <div class="status-item">
      <span>Status</span>
      <span>ONLINE <span class="blink">●</span></span>
    </div>
    <div class="status-item">
      <span>Server Time</span>
      <span>${now}</span>
    </div>
    <div class="status-item">
      <span>Uptime</span>
      <span>${uptimeFormatted}</span>
    </div>
    <div class="status-item">
      <span>Node.js</span>
      <span>${nodeVersion}</span>
    </div>
  </div>

  <h2>▸ ENDPOINTS</h2>

  <div class="endpoint">
    <span class="method">GET</span>
    <span class="url">/api/spampair?nomor=628xxx&amp;key=API_KEY&amp;count=5</span>
    <div class="desc">
      Kirim pairing code ke nomor target.<br>
      Parameter: <code>nomor</code> (wajib), <code>key</code> (wajib), <code>count</code> (opsional, default 5, max 30).
    </div>
  </div>

  <div class="endpoint">
    <span class="method post">POST</span>
    <span class="url">/api/spampair</span>
    <div class="desc">
      Body JSON: <code>{ "nomor": "628xxx", "count": 5 }</code><br>
      Header: <code>x-api-key: API_KEY</code>
    </div>
  </div>

  <div class="endpoint">
    <span class="method">GET</span>
    <span class="url">/api</span>
    <div class="desc">
      Landing page ini + health check endpoint.
    </div>
  </div>

  <h2>▸ CONTOH RESPONSE</h2>
  <div class="endpoint">
    <pre style="color: #888; font-size: 11px; overflow-x: auto;">{
  "status": true,
  "code": 200,
  "target": "6283832110509",
  "total": 5,
  "success": 5,
  "failed": 0,
  "duration": "16.42s",
  "results": [
    { "attempt": 1, "success": true, "code": "ABCD1234" },
    { "attempt": 2, "success": true, "code": "EFGH5678" }
  ]
}</pre>
  </div>

  <h2>▸ ERROR CODES</h2>
  <div class="endpoint">
    <div class="status-item">
      <span><code>400</code> — Nomor invalid</span>
    </div>
    <div class="status-item">
      <span><code>401</code> — API key salah</span>
    </div>
    <div class="status-item">
      <span><code>405</code> — Method not allowed</span>
    </div>
    <div class="status-item">
      <span><code>500</code> — Server error</span>
    </div>
  </div>

  <div class="footer">
    © Mikasa Tools — Built with Baileys
  </div>
</div>
</body>
</html>`;

    res.status(200).send(html);
};
