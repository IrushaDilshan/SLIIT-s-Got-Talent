/**
 * Server Entry Point
 * Initializes database connection and starts Express server
 */

const app = require('./app');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

// Load environment variables from .env file
dotenv.config();

// Connect to MongoDB
connectDB();

// Get port from environment or use default
const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Start server
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`
╔══════════════════════════════════════════════════════════════╗
║  SLIIT Got Talent 2026 - Judge Scoring Dashboard Backend     ║
╠══════════════════════════════════════════════════════════════╣
║  ✓ Server Running                                            ║
║  ✓ Port: ${PORT}                                      ║
║  ✓ Environment: ${NODE_ENV}                              ║
║  ✓ Time: ${new Date().toLocaleTimeString()}                ║
╚══════════════════════════════════════════════════════════════╝
  `);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (error) => {
  console.error('Unhandled Rejection:', error);
  // Close server & exit process
  server.close(() => process.exit(1));
});

// Handle SIGTERM
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    console.log('Process terminated');
  });
});

