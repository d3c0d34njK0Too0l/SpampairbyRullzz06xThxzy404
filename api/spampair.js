const { default: makeWASocket, useMultiFileAuthState, fetchLatestBaileysVersion } = require('@whiskeysockets/baileys');
const pino = require('pino');
const fs = require('fs');
const path = require('path');
const os = require('os');
const crypto = require('crypto');

const API_KEY = 'mks-tlsv6-premysW14KzZlqweKoBclsxm82';

function delay(ms) {
    return new Promise(r => setTimeout(r, ms));
}

module.exports = async (req, res) => {
    const startTime = Date.now();

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-api-key');
    res.setHeader('Content-Type', 'application/json');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    try {
        const apiKey = req.headers['x-api-key'] || req.query.key || req.body?.key;
        if (!apiKey || apiKey !== API_KEY) {
            return res.status(401).json({
                status: false,
                code: 401,
                message: 'Invalid API key'
            });
        }

        let target = '';
        let count = 5;

        if (req.method === 'GET') {
            target = String(req.query.nomor || req.query.target || req.query.number || '');
            count = parseInt(req.query.count || req.query.jumlah) || 5;
        } else if (req.method === 'POST') {
            target = String(req.body?.nomor || req.body?.target || req.body?.number || '');
            count = parseInt(req.body?.count || req.body?.jumlah) || 5;
        } else {
            return res.status(405).json({
                status: false,
                code: 405,
                message: 'Method not allowed. Gunakan GET atau POST.'
            });
        }

        target = target.replace(/\D/g, '');
        if (target.startsWith('0')) target = '62' + target.slice(1);
        if (!target.startsWith('62')) target = '62' + target;

        if (target.length < 10 || target.length > 15) {
            return res.status(400).json({
                status: false,
                code: 400,
                message: 'Number invalid',
                hint: 'Number Target must 10-15 digits',
                example: '6283832110509'
            });
        }

        if (count < 1) count = 1;
        if (count > 30) count = 30;

        const sessionDir = path.join(os.tmpdir(), 'tmp_pairing_' + Date.now() + '_' + crypto.randomBytes(4).toString('hex'));

        let sock = null;
        let success = 0;
        let failed = 0;
        const results = [];

        try {
            fs.mkdirSync(sessionDir, { recursive: true });

            const { state, saveCreds } = await useMultiFileAuthState(sessionDir);
            const { version } = await fetchLatestBaileysVersion();

            sock = makeWASocket({
                printQRInTerminal: false,
                mobile: false,
                auth: state,
                version,
                logger: pino({ level: 'fatal' }),
                browser: ['Mac OS', 'Chrome', '121.0.6167.159'],
                connectTimeoutMs: 30000
            });

            sock.ev.on('creds.update', saveCreds);

            await new Promise((resolve) => {
                const timeout = setTimeout(resolve, 5000);
                sock.ev.on('connection.update', ({ connection }) => {
                    if (connection === 'open' || connection === 'connecting') {
                        clearTimeout(timeout);
                        resolve();
                    }
                });
            });

            for (let i = 0; i < count; i++) {
                try {
                    await delay(1500);
                    const code = await sock.requestPairingCode(target);
                    success++;
                    results.push({
                        attempt: i + 1,
                        success: true,
                        code: code
                    });
                } catch (e) {
                    failed++;
                    results.push({
                        attempt: i + 1,
                        success: false,
                        error: e.message
                    });
                }
            }

            const duration = ((Date.now() - startTime) / 1000).toFixed(2);

            return res.status(200).json({
                status: true,
                code: 200,
                target: target,
                total: count,
                success: success,
                failed: failed,
                duration: duration + 's',
                results: results
            });

        } catch (baileysErr) {
            const duration = ((Date.now() - startTime) / 1000).toFixed(2);
            return res.status(500).json({
                status: false,
                code: 500,
                stage: 'baileys',
                message: baileysErr.message,
                error_name: baileysErr.name,
                error_stack: baileysErr.stack ? baileysErr.stack.split('\n').slice(0, 5).join(' | ') : 'no stack',
                target: target,
                duration: duration + 's'
            });

        } finally {
            try { if (sock) await sock.logout(); } catch (e) {}
            try { if (sock) sock.ws?.close(); } catch (e) {}
            try { fs.rmSync(sessionDir, { recursive: true, force: true }); } catch (e) {}
        }

    } catch (topErr) {
        const duration = ((Date.now() - startTime) / 1000).toFixed(2);
        return res.status(500).json({
            status: false,
            code: 500,
            stage: 'top-level',
            message: topErr.message,
            error_name: topErr.name,
            error_stack: topErr.stack ? topErr.stack.split('\n').slice(0, 5).join(' | ') : 'no stack',
            duration: duration + 's',
            env_check: {
                has_api_key: !!process.env.API_KEY || API_KEY !== 'ganti-ini-kunci-rahasia-lu',
                node_version: process.version
            }
        });
    }
};
