const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const dotenv = require('dotenv');
const rateLimit = require('express-rate-limit');

dotenv.config();

const authRoutes = require('./routes/auth.routes');
const licenseRoutes = require('./routes/license.routes');
const deviceRoutes = require('./routes/device.routes');
const apiRoutes = require('./routes/api.routes');

const app = express();

// Security Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Global Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000 // Limit each IP to 1000 requests per windowMs
});
app.use(limiter);

// Routes
app.use('/auth', authRoutes);
app.use('/licenses', licenseRoutes);
app.use('/devices', deviceRoutes);
app.use('/api/v1', apiRoutes); // Android API

// Health Check
app.get('/', (req, res) => {
  res.send({ status: 'ok', message: 'LONDON VIP License System API is running' });
});

// Error Handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send({ message: 'Something broke!' });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
