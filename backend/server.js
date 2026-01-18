const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

// Load env vars
dotenv.config();

// Check Env
require('./utils/checkEnv')();

// Connect to database
connectDB();

const app = express();

// Middleware
app.use(express.json());
app.use(cors());
app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use(morgan('dev'));

// Serve static files (uploaded documents)
const path = require('path');

const axios = require('axios');

// Fix for legacy Cloudinary images saved with local paths
app.get('/uploads/tripvenza_docs/:filename', async (req, res) => {
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    if (cloudName) {
        // Construct Cloudinary URL
        // Try without extension first (matches current public_ids)
        const cloudUrl = `https://res.cloudinary.com/${cloudName}/image/upload/tripvenza_docs/${req.params.filename}`;

        // Helper to fetch with checking
        const fetchFromCloud = async (url) => {
            return axios({
                method: 'get',
                url: url,
                responseType: 'stream',
                validateStatus: (status) => status < 500 // Accept 404/401 to handle manually, ignore server errors
            });
        };

        try {
            let response = await fetchFromCloud(cloudUrl);

            // If 404, try with .pdf extension
            if (response.status === 404) {
                response = await fetchFromCloud(cloudUrl + '.pdf');
            }

            // If still 404, give up
            if (response.status === 404) {
                return res.status(404).send('File not found');
            }

            // We stream whatever we got (200, 401, etc) as long as it's not 404
            // Forward headers (Content-Type is important)
            res.setHeader('Content-Type', response.headers['content-type']);

            // Force 200 OK for the client to ensure browser displays it
            res.status(200);
            response.data.pipe(res);

        } catch (error) {
            console.error('Proxy Error:', error.message);
            res.status(404).send('File not found');
        }
    } else {
        res.status(404).send('File not found');
    }
});

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
// Routes
const authRoutes = require('./routes/authRoutes');
const visaRoutes = require('./routes/visaRoutes');
const applicationRoutes = require('./routes/applicationRoutes');
const walletRoutes = require('./routes/walletRoutes');
const ocrRoutes = require('./routes/ocrRoutes');
const documentRoutes = require('./routes/documentRoutes');
const ticketRoutes = require('./routes/ticketRoutes');

const countryRoutes = require('./routes/countryRoutes');
const systemRoutes = require('./routes/systemRoutes');
const maintenanceMiddleware = require('./middleware/maintenanceMiddleware');

// Valid for all routes
app.use(maintenanceMiddleware);

app.use('/api/auth', authRoutes);
app.use('/api/visa', visaRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/ocr', ocrRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/countries', countryRoutes);
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/payment', require('./routes/paymentRoutes'));
app.use('/api/system', systemRoutes);

app.get('/', (req, res) => {
    res.send('API is running...');
});

// Global Error Handler
app.use((err, req, res, next) => {
    console.error('🔥 Global Error Handler:', err.message);
    console.error(err.stack);

    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    res.status(statusCode).json({
        success: false,
        message: err.message,
        stack: process.env.NODE_ENV === 'production' ? null : err.stack
    });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

module.exports = app;
// Force Restart
