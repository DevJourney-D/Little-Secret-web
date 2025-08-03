// Development Proxy Server for Neko U - Real API Proxy
const express = require('express');
const cors = require('cors');
const path = require('path');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();
const PORT = 3000;
const API_TARGET = 'https://little-secret-api.vercel.app';

// Enable CORS for all routes
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
    credentials: true
}));

// Handle preflight requests
app.options('*', cors());

// Parse JSON bodies (for local routes only)
app.use(express.json());

// Serve static files
app.use(express.static(path.join(__dirname)));

console.log('🔧 Setting up Real API Proxy...');
console.log('🎯 Target API:', API_TARGET);

// Proxy all /api requests to the real API
app.use('/api', createProxyMiddleware({
    target: API_TARGET,
    changeOrigin: true,
    pathRewrite: {
        '^/api': '/api' // Keep the /api prefix
    },
    onProxyReq: (proxyReq, req, res) => {
        console.log(`🔄 Proxying: ${req.method} ${req.url} -> ${API_TARGET}${req.url}`);
        
        // Add CORS headers
        proxyReq.setHeader('Access-Control-Allow-Origin', '*');
        proxyReq.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS,PATCH');
        proxyReq.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization,X-Requested-With,Accept');
    },
    onProxyRes: (proxyRes, req, res) => {
        // Add CORS headers to response
        proxyRes.headers['Access-Control-Allow-Origin'] = '*';
        proxyRes.headers['Access-Control-Allow-Methods'] = 'GET,POST,PUT,DELETE,OPTIONS,PATCH';
        proxyRes.headers['Access-Control-Allow-Headers'] = 'Content-Type,Authorization,X-Requested-With,Accept';
        
        console.log(`✅ Response: ${proxyRes.statusCode} ${proxyRes.statusMessage}`);
    },
    onError: (err, req, res) => {
        console.error('❌ Proxy Error:', err.message);
        res.status(500).json({
            success: false,
            message: 'ไม่สามารถเชื่อมต่อ API Server ได้',
            error: err.message
        });
    }
}));

app.listen(PORT, () => {
    console.log(`🚀 Neko U Development Proxy Server`);
    console.log(`📱 Local server: http://localhost:${PORT}`);
    console.log(`🔄 Proxying API requests to: ${API_TARGET}`);
    console.log(`🌐 API endpoints: http://localhost:${PORT}/api/*`);
    console.log(`🔧 CORS enabled for all origins`);
    console.log(`📁 Serving static files from: ${__dirname}`);
    console.log(`\n🎯 Try these endpoints:`);
    console.log(`   GET  http://localhost:${PORT}/api/health`);
    console.log(`   POST http://localhost:${PORT}/api/users/login`);
    console.log(`   POST http://localhost:${PORT}/api/users`);
    console.log(`\n💡 All requests to /api/* will be proxied to ${API_TARGET}`);
});
